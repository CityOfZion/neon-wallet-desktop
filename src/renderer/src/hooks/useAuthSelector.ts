import { useAppSelector } from './useRedux'

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

export const useSwapRecordsSelector = () => {
  const { ref, value } = useAppSelector(state => state.auth.data.swapRecords)
  return {
    swapRecords: value,
    swapRecordsRef: ref,
  }
}
