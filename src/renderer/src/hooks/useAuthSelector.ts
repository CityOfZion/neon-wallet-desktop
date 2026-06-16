import orderBy from 'lodash/orderBy'

import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import { TLoginSessionType, TNotification, TNotificationPriority } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const priorityOrder: Record<TNotificationPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
}

const orderNotifications = <T extends TNotification>(notifications: T[]): T[] =>
  orderBy(
    [...notifications],
    [notification => notification.read, notification => priorityOrder[notification.priority], 'date'],
    ['asc', 'asc', 'desc']
  )

const selectHasNewNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return false

    return applicationDataByLoginType[loginSession.type].notifications.some(notification => !notification.read)
  }
)

const selectNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TNotification>()

    return SelectorHelper.fallbackToEmptyArray<TNotification>(
      orderNotifications(applicationDataByLoginType[loginSession.type].notifications)
    )
  }
)

const selectUnreadNotifications = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TNotification>()

    return SelectorHelper.fallbackToEmptyArray<TNotification>(
      orderNotifications(
        applicationDataByLoginType[loginSession.type].notifications.filter(notification => !notification.read)
      )
    )
  }
)

const selectShouldConfirmAction = (loginType?: TLoginSessionType) => {
  return createAppSelector(
    [state => state.auth.data.applicationDataByLoginType, state => state.auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      const currentLoginType = loginType || loginSession?.type

      if (!currentLoginType) return false
      return applicationDataByLoginType[currentLoginType].shouldConfirmAction
    }
  )
}

export const useShouldConfirmActionSelector = (loginType?: TLoginSessionType) => {
  const { value, ref } = useAppSelector(selectShouldConfirmAction(loginType))
  return { shouldConfirmAction: value, shouldConfirmActionRef: ref }
}

export const useLoginSessionSelector = () => {
  const { value, ref } = useAppSelector(state => state.auth.memoryData.loginSession)

  return { loginSession: value, loginSessionRef: ref }
}

export const useHasNewNotificationsSelector = () => {
  const { value, ref } = useAppSelector(selectHasNewNotifications)

  return { hasNewNotifications: value, hasNewNotificationsRef: ref }
}

export const useNotificationsSelector = () => {
  const { value, ref } = useAppSelector(selectNotifications)

  return { notifications: value, notificationsRef: ref }
}

export const useUnreadNotificationsSelector = () => {
  const { value, ref } = useAppSelector(selectUnreadNotifications)

  return { unreadNotifications: value, unreadNotificationsRef: ref }
}
