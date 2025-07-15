import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { hasExplorerService } from '@cityofzion/blockchain-service'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import {
  TFullTransactionAssetEvent,
  TFullTransactionsByAddressResponse,
  TFullTransactionsGroupedDataByDate,
  TFullTransactionsItem,
} from '@shared/@types/hooks'
import { IAccountState, TSelectedNetworks } from '@shared/@types/store'
import { Query, QueryClient, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import * as dateFns from 'date-fns'
import { cloneDeep } from 'lodash'

import { useAccountsSelector } from './useAccountSelector'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useHiddenTokensByBlockchainSelector, usePendingTransactionsSelector } from './useUtilitySelector'

type TBuildGetFullTransactionsQueryKeyParams = {
  account: IAccountState
  network: TNetwork<TBlockchainServiceKey>
  dateFrom?: Date
  dateTo?: Date
  page?: number
}

type TBuildGetFullTransactionsAggregatedQueryKeyParams = {
  dateFrom?: Date
  dateTo?: Date
  accounts?: IAccountState[]
  networksByBlockchain?: TSelectedNetworks
}

type TGetFullTransactionsParams = {
  queryClient: QueryClient
  dateFrom: Date
  dateTo: Date
  accounts: IAccountState[]
  allAccounts: IAccountState[]
  networksByBlockchain: TSelectedNetworks
  page: number
}

type TProps = {
  accounts: IAccountState[]
  dateTo: Date
  dateFrom: Date
}

const createNewDateByTime = (time: number) => new Date(time * 1000)
const formatDateString = (date: Date) => dateFns.format(date, 'yyyy-MM-dd')

export const buildGetFullTransactionsQueryKey = ({
  account: { address, blockchain },
  network,
  dateFrom,
  dateTo,
  page,
}: TBuildGetFullTransactionsQueryKeyParams) => {
  const queryKey: any[] = ['get-full-transactions-by-address', address, blockchain, network]

  if (dateFrom) queryKey.push(formatDateString(dateFrom))
  if (dateTo) queryKey.push(formatDateString(dateTo))
  if (page) queryKey.push(page)

  return queryKey
}

export const buildGetFullTransactionsAggregatedQueryKey = ({
  dateFrom,
  dateTo,
  accounts,
  networksByBlockchain,
}: TBuildGetFullTransactionsAggregatedQueryKeyParams = {}) => {
  const queryKey: any[] = ['get-full-transactions-aggregated-by-address']

  if (!dateFrom || !dateTo || !accounts || !networksByBlockchain) return queryKey

  queryKey.push(
    formatDateString(dateFrom),
    formatDateString(dateTo),
    accounts.map(account => ({ ...account, network: networksByBlockchain[account.blockchain] }))
  )

  return queryKey
}

const getFullTransactions = async ({
  queryClient,
  dateFrom,
  dateTo,
  accounts,
  allAccounts,
  networksByBlockchain,
  page,
}: TGetFullTransactionsParams) => {
  let data = new Map<string, TFullTransactionsItem>()
  let hasNextPage = false

  const promises = accounts.map(async account => {
    const { blockchain } = account
    const network = networksByBlockchain[blockchain]
    const queryCache = queryClient.getQueryCache()
    const queryKey = buildGetFullTransactionsQueryKey({ account, network, dateFrom, dateTo, page })
    const defaultedQueryOptions = queryClient.defaultQueryOptions({ queryKey })
    const query = queryCache.find<TFullTransactionsByAddressResponse>({ queryKey })

    // It means that the query isn't stale, and we can return the data
    if (query && !query.isStaleByTime(Number(defaultedQueryOptions.staleTime))) {
      const { data: queryData } = query.state

      if (queryData) {
        data = queryData.data
        hasNextPage ||= !!queryData.nextCursor
      }

      return
    }

    const previousQuery = queryCache.find<TFullTransactionsByAddressResponse>({
      queryKey: buildGetFullTransactionsQueryKey({
        account,
        network,
        dateFrom,
        dateTo,
        page: page - 1,
      }),
    })

    const nextCursor = previousQuery?.state?.data?.nextCursor

    if (previousQuery && !nextCursor) return

    const service = bsAggregator.blockchainServicesByName[blockchain]

    const queryData: TFullTransactionsByAddressResponse = {
      data: new Map<string, TFullTransactionsItem>(),
      nextCursor: undefined,
    }

    try {
      const dateNow = new Date()

      const response = await service.blockchainDataService.getFullTransactionsByAddress({
        address: account.address,
        dateFrom: dateFrom.toJSON(),
        dateTo: (dateFns.isSameDay(dateTo, dateNow) ? dateNow : dateTo).toJSON(),
        nextCursor,
        pageSize: blockchain === 'neoLegacy' ? 30 : 50,
      })

      queryData.nextCursor = response.nextCursor

      response.data.forEach(({ events, ...item }) => {
        queryData.data.set(item.txId, {
          ...item,
          blockchain,
          isPending: false,
          events: events.map(({ from, to, ...event }) => ({
            ...event,
            from,
            to,
            fromAccount: from ? allAccounts.find(AccountHelper.predicate({ address: from, blockchain })) : undefined,
            toAccount: to ? allAccounts.find(AccountHelper.predicate({ address: to, blockchain })) : undefined,
          })),
        })
      })
    } catch {
      /* empty */
    }

    const newQuery = queryCache.build(queryClient, defaultedQueryOptions) as Query<
      TFullTransactionsByAddressResponse,
      Error,
      TFullTransactionsByAddressResponse,
      string[]
    >

    newQuery.setData(queryData, { manual: true })

    data = new Map<string, TFullTransactionsItem>([...data, ...queryData.data])

    hasNextPage ||= !!queryData.nextCursor
  })

  await Promise.allSettled(promises)

  return { data, page: hasNextPage ? page + 1 : undefined }
}

export const useGetFullTransactions = ({ accounts, dateFrom, dateTo }: TProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation('hooks', { keyPrefix: 'useGetFullTransactions' })
  const { accountsRef } = useAccountsSelector()
  const { networkByBlockchain: networksByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { pendingTransactions } = usePendingTransactionsSelector()
  const { hiddenTokensByBlockchain } = useHiddenTokensByBlockchainSelector()

  const allAccounts = accountsRef.current

  const query = useInfiniteQuery({
    queryKey: buildGetFullTransactionsAggregatedQueryKey({
      accounts,
      dateFrom,
      dateTo,
      networksByBlockchain,
    }),
    queryFn: ({ pageParam: page }) =>
      getFullTransactions({
        queryClient,
        dateFrom,
        dateTo,
        accounts,
        allAccounts,
        networksByBlockchain,
        page,
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page }) => page,
  })

  const data = useMemo(() => {
    if (query.isLoading) return []

    let groupedData = new Map<string, TFullTransactionsItem>()
    const data = cloneDeep(query.data?.pages?.flatMap(page => page?.data ?? []) ?? [])

    data.forEach(items => {
      groupedData = new Map<string, TFullTransactionsItem>([...groupedData, ...items])
    })

    const insertedPendingTransferHashes = new Set<string>()

    pendingTransactions.forEach(({ hash, time, account, to, from, assetHash, token, ...transfer }) => {
      if (
        !accounts.some(AccountHelper.predicate(account)) ||
        !dateFns.isWithinInterval(createNewDateByTime(time), { start: dateFrom, end: dateTo })
      )
        return

      const { blockchain } = account
      const service = bsAggregator.blockchainServicesByName[blockchain]

      let txTemplateUrl: string | undefined
      let addressTemplateUrl: string | undefined
      let contractTemplateUrl: string | undefined

      if (hasExplorerService(service)) {
        txTemplateUrl = service.explorerService.getTxTemplateUrl()
        addressTemplateUrl = service.explorerService.getAddressTemplateUrl()
        contractTemplateUrl = service.explorerService.getContractTemplateUrl()
      }

      const event: TFullTransactionAssetEvent = {
        hash: assetHash,
        eventType: 'token',
        amount: transfer.amount,
        methodName: transfer.methodName || 'transfer',
        hashUrl: contractTemplateUrl?.replace('{hash}', assetHash),
        tokenType: 'generic',
        token,
        from,
        fromUrl: from ? addressTemplateUrl?.replace('{address}', from) : undefined,
        fromAccount: transfer.fromAccount,
        to,
        toUrl: to ? addressTemplateUrl?.replace('{address}', to) : undefined,
        toAccount: transfer.toAccount,
      }

      const wasAlreadyInsertedHash = insertedPendingTransferHashes.has(hash)

      if (wasAlreadyInsertedHash) {
        const transaction = groupedData.get(hash)!

        transaction.events.push(event)

        return
      }

      groupedData.set(hash, {
        txId: hash,
        txIdUrl: txTemplateUrl?.replace('{txId}', hash),
        block: 0,
        date: createNewDateByTime(time).toISOString(),
        invocationCount: 0,
        notificationCount: 0,
        networkFeeAmount: undefined,
        systemFeeAmount: undefined,
        blockchain,
        isPending: true,
        events: [event],
      })

      insertedPendingTransferHashes.add(hash)
    })

    const items = Array.from(groupedData.values()).sort((a, b) => {
      const newerDate = new Date(a.date)
      const olderDate = new Date(b.date)

      if (newerDate > olderDate) return -1
      if (newerDate < olderDate) return 1

      return 0
    })

    const groupedDataByDates = new Map<string, TFullTransactionsGroupedDataByDate>()

    const extendedDateFormat = t('formatExtendedDate')

    items.forEach(item => {
      const hiddenTokens = hiddenTokensByBlockchain[item.blockchain]

      const filteredEvents =
        !!hiddenTokens && hiddenTokens.length > 0
          ? item.events.filter(({ hash }) => !hiddenTokens.includes(hash))
          : null

      if (filteredEvents) item.events = filteredEvents

      const date = dateFns.format(item.date, extendedDateFormat)
      const existingGroupedData = groupedDataByDates.get(date)

      if (existingGroupedData) existingGroupedData.items.push(item)
      else groupedDataByDates.set(date, { date, items: [item] })
    })

    return Array.from(groupedDataByDates.values())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, dateFrom, dateTo, hiddenTokensByBlockchain, pendingTransactions, query.data?.pages, query.isLoading])

  return { ...query, data }
}
