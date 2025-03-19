import { cloneElement, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MdMoreVert } from 'react-icons/md'
import { TbAlertSquare, TbAlertTriangle } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TNotification, TNotificationPriority } from '@shared/@types/store'

import { functionByNotificationActionType } from './functionByNotificationActionType'

type TProps = {
  notification: TNotification
}

const iconsByPriority: Record<TNotificationPriority, JSX.Element> = {
  high: <TbAlertTriangle className="text-pink" />,
  medium: <TbAlertSquare className="text-blue" />,
  low: (
    <div className="flex items-center justify-center text-neon">
      <div className="w-1.5 h-1.5 rounded-full bg-[currentcolor]" />
    </div>
  ),
}

export const Notification = ({ notification }: TProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('modals', { keyPrefix: 'notifications.notification' })
  const modalActions = useModalNavigate()
  const pageNavigate = useNavigate()
  const { accounts } = useAccountsSelector()

  const account = useMemo(
    () =>
      notification.related?.address
        ? accounts.find(
            AccountHelper.predicate({
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

  const handleView = async () => {
    if (!notification.action) return

    const actionsFn = functionByNotificationActionType[notification.action.type]
    if (!actionsFn) return

    await actionsFn({
      modalActions,
      pageNavigate,
      notificationAction: notification.action,
    })
  }

  return (
    <div className="flex gap-2.5 w-full py-2.5 px-4 hover:bg-gray-700/60">
      {cloneElement(icon, {
        'aria-hidden': true,
        className: StyleHelper.mergeStyles(icon.props?.className, 'w-5 h-5 mt-[22px]', {
          'text-gray-300': notification.read,
        }),
      })}

      <div className="flex-grow flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-gray-300 text-1xs">{DateHelper.format(notification.date, t('dateFormat'))}</span>

          {notification.provider && (
            <span
              className={StyleHelper.mergeStyles(
                'text-1xs text-gray-300 capitalize bg-asphalt rounded-full px-2 py-0.5',
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
          className={StyleHelper.mergeStyles('text-white text-xs font-bold capitalize truncate', {
            'text-gray-300': notification.read,
          })}
        >
          {notification.title}
        </p>

        <p
          className={StyleHelper.mergeStyles('text-gray-100 text-1xs capitalize truncate', {
            'text-gray-300': notification.read,
          })}
        >
          {notification.previewBody}
        </p>

        {notification.related?.address && (
          <div className="flex gap-2.5">
            {account && (
              <span className="text-gray-300 text-1xs capitalize">
                {`${t('relatedAccountLabel')}: ${StringHelper.truncateString(account?.name, 10)}`}
              </span>
            )}

            <span className="text-gray-300 text-1xs capitalize">
              {`${t('relatedAddressLabel')}: ${StringHelper.truncateStringStart(notification.related.address, 10)}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <ActionPopover.Root>
          <ActionPopover.Trigger asChild>
            <IconButton compacted icon={<MdMoreVert aria-hidden className="w-5 h-5 min-w-5 min-h-5 text-gray-300" />} />
          </ActionPopover.Trigger>

          <ActionPopover.Content side="bottom" align="end">
            <ActionPopover.Item
              actionPopoverItemType="button"
              label={t('viewButtonLabel')}
              colorSchema="white"
              disabled={!notification.action}
              iconsOnEdge={false}
              onClick={handleView}
            />

            <ActionPopover.Separator />

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
