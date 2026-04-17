import { useMemo } from 'react'

import { hasFullTransactions, type TGetTransactionsByAddressResponse } from '@cityofzion/blockchain-service'
import { Query, QueryClient, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import * as dateFns from 'date-fns'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'
import {
  type TUseTransactionsBuildTransactionsAggregatedQueryKeyParams,
  type TUseTransactionsBuildTransactionsQueryKeyParams,
  type TUseTransactionsGroupedTransactionsByDate,
  type TUseTransactionsProps,
  type TUseTransactionsTransaction,
} from '@shared/types/hooks'
import { TAccount, TSelectedNetworks } from '@shared/types/store'

import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector, usePendingTransactionsSelector } from './useUtilitySelector'

export const buildTransactionsQueryKey = ({
  address,
  blockchain,
  network,
  dateFrom,
  dateTo,
  page,
}: TUseTransactionsBuildTransactionsQueryKeyParams) => {
  const queryKey: any[] = ['transactions-by-address', address, blockchain, network]

  if (dateFrom) {
    queryKey.push(DateHelper.format(dateFrom, 'yyyy-MM-dd'))
  }

  if (dateTo) {
    queryKey.push(DateHelper.format(dateTo, 'yyyy-MM-dd'))
  }

  if (page) {
    queryKey.push(page)
  }

  return queryKey
}

export const buildTransactionsAggregatedQueryKey = ({
  dateFrom,
  dateTo,
  accounts,
  networksByBlockchain,
}: TUseTransactionsBuildTransactionsAggregatedQueryKeyParams = {}) => {
  const queryKey: any[] = ['transactions-aggregated-by-address']

  if (!dateFrom || !dateTo || !accounts || !networksByBlockchain) {
    return queryKey
  }

  queryKey.push(
    DateHelper.format(dateFrom, 'yyyy-MM-dd'),
    DateHelper.format(dateTo, 'yyyy-MM-dd'),
    accounts.map(account => ({ ...account, network: networksByBlockchain[account.blockchain] }))
  )

  return queryKey
}

const fetchTransactions = async (
  queryClient: QueryClient,
  dateFrom: Date,
  dateTo: Date,
  accounts: TAccount[],
  networksByBlockchain: TSelectedNetworks,
  page: number,
  shouldUseFullTransactionsService: boolean
) => {
  const transactions: TUseTransactionsTransaction[] = []
  let hasNextPage = false

  const promises = accounts.map(async account => {
    const { blockchain } = account
    const network = networksByBlockchain[blockchain]
    const queryCache = queryClient.getQueryCache()
    const queryKey = buildTransactionsQueryKey({
      address: account.address,
      blockchain,
      network,
      dateFrom,
      dateTo,
      page,
    })
    const defaultedQueryOptions = queryClient.defaultQueryOptions({ queryKey })
    const query = queryCache.find<TGetTransactionsByAddressResponse<TBlockchainServiceKey>>({ queryKey })

    // It means that the query isn't stale, and we can return the data
    if (query && !query.isStaleByTime(Number(defaultedQueryOptions.staleTime))) {
      if (query.state.data) {
        transactions.push(...query.state.data.transactions)
        hasNextPage ||= !!query.state.data.nextPageParams
      }

      return
    }

    const previousQuery = queryCache.find<TGetTransactionsByAddressResponse<TBlockchainServiceKey>>({
      queryKey: buildTransactionsQueryKey({
        address: account.address,
        blockchain,
        network,
        dateFrom,
        dateTo,
        page: page - 1,
      }),
    })

    const previousNextPageParams = previousQuery?.state?.data?.nextPageParams

    // It means that there is no more pages to fetch
    if (previousQuery && !previousNextPageParams) return

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

    let queryDataTransactions: TGetTransactionsByAddressResponse<TBlockchainServiceKey>['transactions'] = []
    let queryDataNextPageParams: TGetTransactionsByAddressResponse<TBlockchainServiceKey>['nextPageParams'] = undefined

    try {
      let response: TGetTransactionsByAddressResponse<TBlockchainServiceKey>

      if (hasFullTransactions(service) && shouldUseFullTransactionsService) {
        const dateNow = new Date()

        response = await service.fullTransactionsDataService.getFullTransactionsByAddress({
          address: account.address,
          dateFrom: dateFrom.toJSON(),
          dateTo: (dateFns.isSameDay(dateTo, dateNow) ? dateNow : dateTo).toJSON(),
          nextPageParams: previousNextPageParams,
          pageSize: 50,
        })
      } else {
        response = await service.blockchainDataService.getTransactionsByAddress({
          address: account.address,
          nextPageParams: previousNextPageParams,
        })
      }

      queryDataNextPageParams = response.nextPageParams

      queryDataTransactions = response.transactions
    } catch {
      /* empty */
    }

    const newQuery = queryCache.build(queryClient, defaultedQueryOptions) as Query<
      TGetTransactionsByAddressResponse<TBlockchainServiceKey>,
      Error,
      TGetTransactionsByAddressResponse<TBlockchainServiceKey>,
      string[]
    >

    newQuery.setData({ transactions: queryDataTransactions, nextPageParams: queryDataNextPageParams }, { manual: true })

    transactions.push(...queryDataTransactions)

    hasNextPage ||= !!queryDataNextPageParams
  })

  await Promise.allSettled(promises)

  return { transactions, page: hasNextPage ? page + 1 : undefined }
}

export const useTransactions = ({
  accounts,
  dateFrom,
  dateTo,
  shouldUseFullTransactionsService,
}: TUseTransactionsProps) => {
  const queryClient = useQueryClient()
  const { networkByBlockchain: networksByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { pendingTransactions } = usePendingTransactionsSelector()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  const query = useInfiniteQuery({
    queryKey: buildTransactionsAggregatedQueryKey({
      accounts,
      dateFrom,
      dateTo,
      networksByBlockchain,
    }),
    queryFn: ({ pageParam: page }) =>
      fetchTransactions(
        queryClient,
        dateFrom,
        dateTo,
        accounts,
        networksByBlockchain,
        page,
        shouldUseFullTransactionsService
      ),
    initialPageParam: 1,
    getNextPageParam: ({ page }) => page,
  })

  const data = useMemo(() => {
    if (query.isLoading || !query.data) return []

    const allTransactions = query.data.pages.flatMap(page => page.transactions)

    const groupedTransactionsMap = new Map<string, TUseTransactionsTransaction>(
      allTransactions.map(transaction => [transaction.txId, transaction])
    )

    pendingTransactions.forEach(transaction => {
      if (
        transaction.relatedAddress &&
        accounts.some(
          SharedAccountHelper.predicate({ address: transaction.relatedAddress, blockchain: transaction.blockchain })
        ) &&
        dateFns.isWithinInterval(transaction.date, { start: dateFrom, end: dateTo })
      ) {
        groupedTransactionsMap.set(transaction.txId, transaction)
      }
    })

    const sortedTransactions = Array.from(groupedTransactionsMap.values()).sort((a, b) => {
      const newerDate = new Date(a.date)
      const olderDate = new Date(b.date)

      if (newerDate > olderDate) return -1
      if (newerDate < olderDate) return 1

      return 0
    })

    const groupedDataByDates = new Map<string, TUseTransactionsGroupedTransactionsByDate>()

    sortedTransactions.forEach(transaction => {
      const hiddenTokens = hiddenTokensByBlockchain[transaction.blockchain]
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[transaction.blockchain]

      if (!!hiddenTokens && hiddenTokens.length > 0) {
        const isHiddenToken = (tokenHash: string) => {
          return hiddenTokens.includes(service.tokenService.normalizeHash(tokenHash))
        }

        if (transaction.view === 'utxo') {
          transaction.inputs = transaction.inputs.filter(({ token }) => !isHiddenToken(token.hash))
          transaction.outputs = transaction.outputs.filter(({ token }) => !isHiddenToken(token.hash))
        } else {
          transaction.events = transaction.events.filter(event => {
            if (event.eventType !== 'token') return true

            const tokenHash = event.token?.hash
            if (!tokenHash) return true

            return !isHiddenToken(tokenHash)
          })
        }
      }

      const date = DateHelper.format(transaction.date, 'MM-dd-yyyy')
      const existingGroupedData = groupedDataByDates.get(date)

      if (existingGroupedData) {
        existingGroupedData.transactions.push(transaction)
        return
      }

      groupedDataByDates.set(date, { date, transactions: [transaction] })
    })

    return Array.from(groupedDataByDates.values())
  }, [accounts, dateFrom, dateTo, hiddenTokensByBlockchain, pendingTransactions, query.data, query.isLoading])

  return { ...query, data }
}
