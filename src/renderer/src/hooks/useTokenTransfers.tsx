import { useCallback, useEffect, useRef, useState } from 'react'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { RootStore } from '@renderer/store/RootStore'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TFetchTransactionsResponse, TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { Query, useQueryClient } from '@tanstack/react-query'

import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

type TProps = {
  accounts: IAccountState[]
}

function buildQueryKey(account: IAccountState, network: TNetwork<TBlockchainServiceKey>, page: number) {
  return ['token-transfers', account.id, network.id, page]
}

export function useTokenTransfers({ accounts }: TProps) {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const queryClient = useQueryClient()

  const page = useRef(1)

  const [isLoading, setIsLoading] = useState(false)

  const [data, setData] = useState<TUseTransactionsTransfer[]>([])

  const fetch = useCallback(async () => {
    const promises = accounts.map(async account => {
      const network = networkByBlockchain[account.blockchain]

      const pageIndex = page.current - 1
      const queryCache = queryClient.getQueryCache()

      const queryKey = buildQueryKey(account, network, page.current)

      const previousQueryKey = queryKey.slice(0, -1)
      const previousQueries = queryCache.findAll({
        queryKey: previousQueryKey,
      }) as Query<TFetchTransactionsResponse>[]

      const query = previousQueries[pageIndex]

      if (query && !query.isStale()) {
        const queriesToReturn = previousQueries.slice(0, page.current + 1)
        return queriesToReturn.flatMap(q => q.state.data!.transfers)
      }

      if (page.current === 1) {
        setIsLoading(true)
      }

      const service = bsAggregator.blockchainServicesByName[account.blockchain]
      const queryData: TFetchTransactionsResponse = {
        transfers: [],
        nextPageParams: undefined,
      }

      try {
        const store = RootStore.store.getState()
        const previousQuery = previousQueries[pageIndex - 1]

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
              toAccount: store.account.data.find(a => a.address === transfer.to),
              fromAccount: store.account.data.find(a => a.address === transfer.from),
            })
          })
        })
      } catch (error) {
        /* empty */
      }

      const defaultedOptions = queryClient.defaultQueryOptions({ queryKey })
      const newQuery = queryCache.build(queryClient, defaultedOptions) as Query<
        TFetchTransactionsResponse,
        Error,
        TFetchTransactionsResponse,
        string[]
      >
      newQuery.setData(queryData, { manual: true })

      const response = [...previousQueries.slice(0, pageIndex), newQuery].flatMap(q => q.state.data!.transfers)

      return response
    })

    const data = await Promise.all(promises)

    setIsLoading(false)

    setData(data.flat())
  }, [accounts, networkByBlockchain, queryClient])

  const fetchNextPage = useCallback(() => {
    page.current += 1
    fetch()
  }, [fetch])

  useEffect(() => {
    fetch()
  }, [accounts, networkByBlockchain, fetch])

  return {
    data,
    isLoading,
    fetchNextPage,
  }
}
