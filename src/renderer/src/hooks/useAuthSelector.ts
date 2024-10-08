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
