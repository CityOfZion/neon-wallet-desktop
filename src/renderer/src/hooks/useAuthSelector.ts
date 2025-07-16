import { TNotification, TNotificationPriority } from '@shared/@types/store'
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
    [item => item.read, item => priorityOrder[item.priority], 'date'],
    ['asc', 'asc', 'desc']
  )
}

const selectHasNewNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) =>
    applicationDataByLoginType[currentLoginSession?.type ?? 'password'].notifications.some(
      notification => !notification.read
    )
)

const selectAllNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) =>
    orderNotifications(applicationDataByLoginType[currentLoginSession?.type ?? 'password'].notifications)
)

const selectUnreadNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) =>
    applicationDataByLoginType[currentLoginSession?.type ?? 'password'].notifications.filter(
      notification => !notification.read
    )
)

export const useCurrentLoginSessionSelector = () => {
  const { ref, value } = useAppSelector(state => state.auth.inMemoryData.currentLoginSession)
  return {
    currentLoginSession: value,
    currentLoginSessionRef: ref,
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

export const useUnreadNotificationsSelector = () => {
  const { ref, value } = useAppSelector(selectUnreadNotifications)
  return {
    unreadNotifications: value,
    unreadNotificationsRef: ref,
  }
}
