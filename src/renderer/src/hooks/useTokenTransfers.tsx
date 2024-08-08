import { useMemo } from 'react'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TFetchTransactionsResponse, TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState, TSelectedNetworks } from '@shared/@types/store'
import { Query, QueryClient, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { useAccountsSelector } from './useAccountSelector'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

type TProps = {
  accounts: IAccountState[]
}

export function buildQueryKeyTokenTransfer(
  account: IAccountState,
  network: TNetwork<TBlockchainServiceKey>,
  page?: number
) {
  const key: any[] = ['token-transfers', account.address, account.blockchain, network.id]
  if (page) {
    key.push(page)
  }
  return key
}

export function buildQueryKeyTokenTransferAggregate(
  accounts?: IAccountState[],
  networkByBlockchain?: TSelectedNetworks
) {
  if (!accounts || !networkByBlockchain) {
    return ['token-transfers-aggregate']
  }

  return [
    'token-transfers-aggregate',
    accounts.map(account => ({ ...account, network: networkByBlockchain[account.blockchain] })),
  ]
}

async function fetchTransactions(
  accounts: IAccountState[],
  allAccounts: IAccountState[],
  queryClient: QueryClient,
  networkByBlockchain: TSelectedNetworks,
  page: number
) {
  const data: TUseTransactionsTransfer[] = []
  let hasMorePage = false

  const promises = accounts.map(async account => {
    const network = networkByBlockchain[account.blockchain]

    const queryCache = queryClient.getQueryCache()

    const queryKey = buildQueryKeyTokenTransfer(account, network, page)
    const defaultedOptions = queryClient.defaultQueryOptions({ queryKey })

    const query = queryCache.find({
      queryKey,
    }) as Query<TFetchTransactionsResponse> | undefined

    // It means that the query is not stale and we can return the data
    if (query && !query.isStaleByTime(defaultedOptions.staleTime)) {
      data.push(...query.state.data!.transfers)
      hasMorePage ||= !!query.state.data!.nextPageParams
      return
    }

    const previousQuery = queryCache.find({
      queryKey: buildQueryKeyTokenTransfer(account, network, page - 1),
    }) as Query<TFetchTransactionsResponse> | undefined

    // It means that there are no more pages to fetch
    if (previousQuery && !previousQuery.state.data?.nextPageParams) {
      return
    }

    const service = bsAggregator.blockchainServicesByName[account.blockchain]
    const queryData: TFetchTransactionsResponse = {
      transfers: [],
      nextPageParams: undefined,
    }

    try {
      const data = await service.blockchainDataService.getTransactionsByAddress({
        address: account.address,
        nextPageParams: previousQuery?.state.data?.nextPageParams,
      })

      queryData.nextPageParams = data.nextPageParams
      data.transactions.forEach(transaction => {
        transaction.transfers.forEach(transfer => {
          if (transfer.type === 'nft') return

          queryData.transfers.push({
            ...transfer,
            time: transaction.time,
            hash: transaction.hash,
            account,
            toAccount: allAccounts.find(a => a.address === transfer.to),
            fromAccount: allAccounts.find(a => a.address === transfer.from),
          })
        })
      })
    } catch (error) {
      /* empty */
    }

    const newQuery = queryCache.build(queryClient, defaultedOptions) as Query<
      TFetchTransactionsResponse,
      Error,
      TFetchTransactionsResponse,
      string[]
    >
    newQuery.setData(queryData, { manual: true })

    data.push(...queryData.transfers)
    hasMorePage ||= !!queryData.nextPageParams
  })

  await Promise.allSettled(promises)
  return {
    data,
    page: hasMorePage ? page + 1 : undefined,
  }
}

export function useTokenTransfers({ accounts }: TProps) {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()
  const { accountsRef } = useAccountsSelector()

  const query = useInfiniteQuery({
    queryKey: buildQueryKeyTokenTransferAggregate(accounts, networkByBlockchain),
    queryFn: ({ pageParam }) =>
      fetchTransactions(accounts, accountsRef.current, queryClient, networkByBlockchain, pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ page }) => page,
  })

  const aggregatedData = useMemo(() => {
    return (
      query.data?.pages
        .flatMap(page => page.data)
        .sort((itemA, itemB) => {
          if (itemA.time < itemB.time) {
            return 1
          }

          if (itemA.time > itemB.time) {
            return -1
          }

          return 0
        }) ?? []
    )
  }, [query.data])

  return {
    aggregatedData,
    ...query,
  }
}
