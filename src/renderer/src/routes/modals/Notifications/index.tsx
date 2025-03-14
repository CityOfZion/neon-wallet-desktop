import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import { TbBell } from 'react-icons/tb'
import { Separator } from '@renderer/components/Separator'
import { useNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'

import { Notification } from './Notification'

export const NotificationsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'notifications' })
  const { notifications } = useNotificationsSelector()

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbBell aria-hidden />}
      contentClassName="flex flex-col items-center px-0"
    >
      {notifications.length === 0 ? (
        <Fragment>
          <TbBell className="text-gray-300 w-28 h-28 stroke-1 mt-20" aria-hidden />
          <p className="mt-7 text-white font-sans-medium text-lg">{t('emptyListTitle')}</p>
          <p className="text-gray-100 text-sm font-sans-regular mt-3.5">{t('emptyListBody')}</p>
        </Fragment>
      ) : (
        <ul className="w-full flex-grow overflow-auto">
          {notifications.map((notification, index) => (
            <li key={notification.id}>
              <Notification notification={notification} />
              {index + 1 !== notifications.length && <Separator containerClassName="px-4" />}
            </li>
          ))}
        </ul>
      )}
    </SideModalLayout>
  )
}
