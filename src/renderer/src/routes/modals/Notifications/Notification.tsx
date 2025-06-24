import { cloneElement, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MdMoreVert } from 'react-icons/md'
import { TbAlertSquare, TbAlertTriangle } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TNotification, TNotificationPriority } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { functionByNotificationActionType } from './functionByNotificationActionType'

type TProps = {
  notification: TNotification
}

const iconsByPriority: Record<TNotificationPriority, JSX.Element> = {
  high: <TbAlertTriangle className="text-pink" />,
  medium: <TbAlertSquare className="text-blue" />,
  low: (
    <div className="flex items-center justify-center text-neon">
      <div className="h-1.5 w-1.5 rounded-full bg-[currentcolor]" />
    </div>
  ),
}

export const Notification = ({ notification }: TProps) => {
  const dispatch = useAppDispatch()
  const { t: globalT } = useTranslation()
  const { t } = useTranslation('modals', { keyPrefix: 'notifications.notification' })
  const modalActions = useModalNavigate()
  const pageNavigate = useNavigate()
  const { accounts } = useAccountsSelector()

  const account = useMemo(
    () =>
      notification.related?.address
        ? accounts.find(
            SharedAccountHelper.predicate({
              address: notification.related.address!,
              blockchain: notification.related.blockchain,
            })
          )
        : undefined,
    [accounts, notification.related?.address, notification.related?.blockchain]
  )

  const icon = iconsByPriority[notification.priority ?? 'low']

  const handleToggleRead = () => {
    dispatch(
      authReducerActions.saveNotification({
        ...notification,
        read: !notification.read,
      })
    )
  }

  const handleClick = async () => {
    try {
      if (!notification.action || notification.read) return

      const actionsFn = functionByNotificationActionType[notification.action.type]
      if (!actionsFn) return

      await actionsFn({
        modalActions,
        pageNavigate,
        notificationAction: notification.action,
      })
    } catch (error: any) {
      console.error(error)
      ToastHelper.error({ message: error.message })
    }
  }

  const handleStopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <div
      className={StyleHelper.mergeStyles('flex w-full gap-2.5 px-4 py-2.5', {
        'cursor-pointer hover:bg-gray-700/60': notification.action && !notification.read,
      })}
      onClick={handleClick}
      role="button"
    >
      {cloneElement(icon, {
        'aria-hidden': true,
        className: StyleHelper.mergeStyles(icon.props?.className, 'w-5 h-5 mt-[22px]', {
          'text-gray-300': notification.read,
        }),
      })}

      <div className="flex min-w-0 flex-grow flex-col gap-0.5">
        <div className="flex items-center gap-2.5">
          <span className="text-1xs text-gray-300">{DateHelper.format(notification.date, t('dateFormat'))}</span>

          {notification.provider && (
            <span
              className={StyleHelper.mergeStyles(
                'rounded-full bg-asphalt px-2 py-0.5 text-1xs capitalize text-gray-300',
                {
                  'bg-gray-300/15 text-gray-100/50': notification.read,
                }
              )}
            >
              {notification.provider}
            </span>
          )}
        </div>

        <p
          className={StyleHelper.mergeStyles('truncate text-xs font-bold text-white', {
            'text-gray-300': notification.read,
          })}
        >
          {globalT(notification.title, { defaultValue: notification.title })}
        </p>

        <p
          className={StyleHelper.mergeStyles('truncate text-1xs text-gray-100', {
            'text-gray-300': notification.read,
          })}
        >
          {globalT(notification.previewBody, { defaultValue: notification.previewBody })}
        </p>

        {notification.related?.address && (
          <div className="flex gap-2.5">
            {account && (
              <span className="text-1xs capitalize text-gray-300">
                {`${t('relatedAccountLabel')}: ${StringHelper.truncateString(account?.name, 10)}`}
              </span>
            )}

            <span className="text-1xs capitalize text-gray-300">
              {`${t('relatedAddressLabel')}: ${StringHelper.truncateStringStart(notification.related.address, 10)}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <ActionPopover.Root>
          <ActionPopover.Trigger asChild>
            <IconButton
              compacted
              icon={<MdMoreVert aria-hidden className="h-5 min-h-5 w-5 min-w-5 text-gray-300" />}
              onClick={handleStopPropagation}
            />
          </ActionPopover.Trigger>

          <ActionPopover.Content side="bottom" align="end" onClick={handleStopPropagation}>
            <ActionPopover.Item
              actionPopoverItemType="button"
              label={notification.read ? t('markAsUnreadButtonLabel') : t('markAsReadButtonLabel')}
              colorSchema="white"
              iconsOnEdge={false}
              onClick={handleToggleRead}
            />
          </ActionPopover.Content>
        </ActionPopover.Root>
      </div>
    </div>
  )
}
