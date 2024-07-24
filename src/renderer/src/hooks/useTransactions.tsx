import { useMemo, useRef, useState } from 'react'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TFetchTransactionsResponse, TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { useQueries } from '@tanstack/react-query'

import { useAccountsSelector } from './useAccountSelector'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

type TProps = {
  accounts: IAccountState[]
}

export const useTransactions = ({ accounts }: TProps) => {
  const { accountsRef: allAccountRef } = useAccountsSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const [page, setPage] = useState(1)

  const combinedQueries = useQueries({
    queries: accounts.map(account => ({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ['transactions', account.id, page, networkByBlockchain[account.blockchain].id],
      queryFn: async (): Promise<TFetchTransactionsResponse> => {
        const service = bsAggregator.blockchainServicesByName[account.blockchain]
        try {
          const data = await service.blockchainDataService.getTransactionsByAddress({
            address: account.address,
            page,
          })

          const totalPages = Math.ceil(data.totalCount / data.limit)

          const transfers: TUseTransactionsTransfer[] = []
          data.transactions.forEach(transaction => {
            transaction.transfers.forEach(transfer => {
              if (transfer.type === 'nft') return

              transfers.push({
                ...transfer,
                time: transaction.time,
                hash: transaction.hash,
                account,
                toAccount: allAccountRef.current.find(a => a.address === transfer.to),
                fromAccount: allAccountRef.current.find(a => a.address === transfer.from),
              })
            })
          })

          return {
            transfers,
            hasMore: page < totalPages,
            page,
          }
        } catch (error: any) {
          return {
            transfers: [],
            hasMore: false,
            page,
          }
        }
      },
    })),
    combine: results => {
      return {
        data: results
          .map(result => result.data?.transfers)
          .flat()
          .filter((transaction): transaction is TUseTransactionsTransfer => !!transaction),
        isLoading: results.some(result => result.isLoading),
        hasMore: results.some(result => result.data?.hasMore),
      }
    },
  })

  const dataRef = useRef<TFetchTransactionsResponse[]>([
    {
      hasMore: combinedQueries.hasMore,
      page: 1,
      transfers: combinedQueries.data,
    },
  ])

  const transfers = useMemo(() => {
    if (dataRef.current.some(item => item.page === page)) {
      dataRef.current = dataRef.current.map(item => {
        if (item.page === page) {
          return {
            transfers: combinedQueries.data,
            hasMore: combinedQueries.hasMore,
            page,
          }
        }

        return item
      })
    } else {
      dataRef.current.push({
        transfers: combinedQueries.data,
        hasMore: combinedQueries.hasMore,
        page,
      })
    }

    return dataRef.current.map(item => item.transfers).flat()
  }, [combinedQueries.data, combinedQueries.hasMore, page])

  const isLoading = useMemo(() => {
    if (transfers.length === 0) return combinedQueries.isLoading
    return false
  }, [transfers, combinedQueries.isLoading])

  const fetchNextPage = () => {
    const last = dataRef.current[dataRef.current.length - 1]

    if (!last || !last.hasMore) return

    setPage(prev => prev + 1)
  }

  return {
    transfers,
    fetchNextPage,
    isLoading,
  }
}
