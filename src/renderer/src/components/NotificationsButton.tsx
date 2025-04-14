import { useTranslation } from 'react-i18next'
import { TbBell } from 'react-icons/tb'
import { IconButton } from '@renderer/components/IconButton'
import { useHasNewNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

const NotificationsIcon = () => {
  const { t } = useTranslation('components', { keyPrefix: 'notificationsButton' })
  const { hasNewNotifications } = useHasNewNotificationsSelector()

  return (
    <div className="relative">
      <TbBell className="w-6 h-6" aria-hidden />

      {hasNewNotifications && (
        <div
          aria-label={t('unreadNotifications')}
          className="absolute w-1 h-1 bg-pink rounded-full top-0.5 right-0.5 border-2 border-asphalt box-content"
        />
      )}
    </div>
  )
}

export const NotificationsButton = () => {
  const { t } = useTranslation('components', { keyPrefix: 'notificationsButton' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <IconButton
      text={t('label')}
      size="md"
      className="min-w-14"
      icon={<NotificationsIcon />}
      onClick={modalNavigateWrapper('notifications')}
    />
  )
}
