import { cloneElement, type JSX, SyntheticEvent, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ActionPopover } from '@renderer/components/ActionPopover'
import { Badge } from '@renderer/components/Badge'
import { IconButton } from '@renderer/components/IconButton'

import { DateHelper } from '@renderer/helpers/DateHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import MdMoreVert from '@renderer/assets/images/md-more-vert.svg?react'
import TbAlertSquare from '@renderer/assets/images/tb-alert-square.svg?react'
import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TNotification, TNotificationPriority } from '@shared/types/store'

import { functionByNotificationActionType } from './functionByNotificationActionType'

type TProps = {
  notification: TNotification
}

const iconsByPriority: Record<TNotificationPriority, JSX.Element> = {
  high: <TbAlertTriangle className="text-pink" />,
  medium: <TbAlertSquare className="text-blue" />,
  low: (
    <div className="text-neon flex items-center justify-center">
      <div className="size-1.5 rounded-full bg-current" />
    </div>
  ),
}

export const Notification = ({ notification }: TProps) => {
  const dispatch = useAppDispatch()
  const { t: tGlobal } = useTranslation()
  const { t } = useTranslation('modals', { keyPrefix: 'notifications.notification' })
  const modalActions = useModalNavigate()
  const pageNavigate = useNavigate()
  const { accounts } = useAccountsSelector()
  const { language } = useLanguageSelector()

  const account = useMemo(() => {
    return notification.related?.address
      ? accounts.find(
          SharedAccountHelper.predicate({
            address: notification.related.address!,
            blockchain: notification.related.blockchain,
          })
        )
      : undefined
  }, [accounts, notification.related?.address, notification.related?.blockchain])

  const icon = iconsByPriority[notification.priority || 'low']

  const handleToggleRead = event => {
    event.preventDefault()
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

      dispatch(
        authReducerActions.saveNotification({
          ...notification,
          read: true,
        })
      )
    } catch (error) {
      LoggerHelper.error(error, { where: 'Notification', operation: 'clickNotification' })
      ToastHelper.error({ message: AppError.wrap(error).displayMessage })
    }
  }

  const handleStopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation()
  }

  return (
    <div
      className={StyleHelper.mergeStyles('flex w-full cursor-auto gap-2.5 px-4 py-2.5', {
        'cursor-pointer hover:bg-gray-700/60': notification.action && !notification.read,
      })}
      aria-disabled={notification.read}
      onClick={handleClick}
      role="button"
    >
      {cloneElement(icon, {
        'aria-hidden': true,
        className: StyleHelper.mergeStyles(icon.props?.className, 'h-5 max-h-5 min-h-5 w-5 min-w-5 mt-[22px]', {
          'text-gray-300': notification.read,
        }),
      })}

      <div className="flex min-w-0 grow flex-col gap-0.5">
        <div className="flex items-center gap-2.5">
          <span className="text-1xs text-gray-300">
            {DateHelper.formatLocalized(notification.date, { format: 'Pp', language })}
          </span>

          {notification.provider && (
            <Badge
              className={StyleHelper.mergeStyles('rounded-full px-2 font-normal text-gray-300 normal-case', {
                'bg-gray-300/15 text-gray-100/50': notification.read,
              })}
            >
              {t(`providerLabels.${notification.provider}`)}
            </Badge>
          )}
        </div>

        <p
          className={StyleHelper.mergeStyles('text-xs font-bold text-white', {
            'text-gray-300': notification.read,
          })}
        >
          {tGlobal(notification.title, { defaultValue: notification.title, value: notification.titleValue })}
        </p>

        <p
          className={StyleHelper.mergeStyles('text-1xs text-gray-100', {
            'text-gray-300': notification.read,
          })}
        >
          {tGlobal(notification.previewBody, {
            defaultValue: notification.previewBody,
            value: notification.previewBodyValue,
          })}
        </p>

        {notification.related?.address && (
          <div className="flex gap-2.5">
            {account && (
              <span className="text-1xs w-full max-w-[50%] truncate text-gray-300">
                {t('relatedAccountLabel')}: {account?.name}
              </span>
            )}

            <span className="text-1xs text-gray-300">
              {t('relatedAddressLabel')}: {StringHelper.truncateStart(notification.related.address, 10)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <ActionPopover.Root>
          <ActionPopover.Trigger asChild>
            <IconButton
              aria-label={t('actionsButtonLabel')}
              compacted
              icon={<MdMoreVert aria-hidden className="h-6 min-h-6 w-6 min-w-6 text-gray-300" />}
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
