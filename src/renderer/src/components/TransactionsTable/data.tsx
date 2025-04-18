import { useMemo } from 'react'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { useTokenTransfers } from '@renderer/hooks/useTokenTransfers'
import { usePendingTransactionsSelector } from '@renderer/hooks/useUtilitySelector'
import { IAccountState } from '@shared/@types/store'

export const useData = (accounts: IAccountState[]) => {
  const { pendingTransactions } = usePendingTransactionsSelector()

  const { aggregatedData, fetchNextPage, isLoading } = useTokenTransfers({ accounts })

  const allTransfers = useMemo(
    () =>
      pendingTransactions
        .filter(transaction => accounts.some(AccountHelper.predicate(transaction.account)))
        .concat(aggregatedData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts, pendingTransactions, aggregatedData, aggregatedData.length]
  )

  return {
    allTransfers,
    fetchNextPage,
    isLoading,
  }
}
