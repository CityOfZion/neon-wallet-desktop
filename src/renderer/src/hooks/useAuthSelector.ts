import { IAccountState } from '@shared/@types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectHasClaimPendingTransaction = (account: IAccountState) =>
  createAppSelector([state => state.auth.pendingTransactions], pendingTransactions => {
    return pendingTransactions.some(transaction => !!transaction.isClaim && transaction.account.id === account.id)
  })

export const useCurrentLoginSessionSelector = () => {
  const { ref, value } = useAppSelector(state => state.auth.currentLoginSession)
  return {
    currentLoginSession: value,
    currentLoginSessionRef: ref,
  }
}

export const usePendingTransactionsSelector = () => {
  const { ref, value } = useAppSelector(state => state.auth.pendingTransactions)
  return {
    pendingTransactions: value,
    pendingTransactionsRef: ref,
  }
}

export const useHasClaimPendingTransactionSelector = (account: IAccountState) => {
  const { ref, value } = useAppSelector(selectHasClaimPendingTransaction(account))
  return {
    hasClaimPendingTransaction: value,
    hasClaimPendingTransactionRef: ref,
  }
}

export const useSwapRecordsSelector = () => {
  const { ref, value } = useAppSelector(state => state.auth.data.swapRecords)
  return {
    swapRecords: value,
    swapRecordsRef: ref,
  }
}
