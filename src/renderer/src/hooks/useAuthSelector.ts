import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { IAccountState, TNotification, TNotificationPriority } from '@shared/@types/store'
import lodash from 'lodash'

import { createAppSelector, useAppSelector } from './useRedux'

const priorityOrder: Record<TNotificationPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
}

const orderNotifications = <T extends TNotification>(notifications: T[]): T[] => {
  return lodash.orderBy(
    [...notifications],
    [item => !!item.read, item => priorityOrder[item.priority], 'date'],
    ['asc', 'asc', 'desc']
  )
}

const selectHasNewNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) =>
    applicationDataByLoginType[currentLoginSession?.type ?? 'password'].notifications.some(
      notification => !notification.read
    )
)

const selectAllNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) =>
    orderNotifications(applicationDataByLoginType[currentLoginSession?.type ?? 'password'].notifications)
)

const selectHasClaimPendingTransaction = (account: IAccountState) =>
  createAppSelector([state => state.auth.pendingTransactions], pendingTransactions =>
    pendingTransactions.some(
      transaction => !!transaction.isClaim && AccountHelper.predicate(transaction.account)(account)
    )
  )

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

export const useLastIndexesByWallet = () => {
  const { ref, value } = useAppSelector(state => state.auth.data.lastIndexesByWallet)
  return {
    lastIndexesByWallet: value,
    lastIndexesByWalletRef: ref,
  }
}

export const useHasNewNotificationsSelector = () => {
  const { ref, value } = useAppSelector(selectHasNewNotifications)
  return {
    hasNewNotifications: value,
    hasNewNotificationsRef: ref,
  }
}

export const useNotificationsSelector = () => {
  const { ref, value } = useAppSelector(selectAllNotifications)
  return {
    notifications: value,
    notificationsRef: ref,
  }
}
