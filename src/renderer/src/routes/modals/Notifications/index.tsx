import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import { useNotificationsSelector } from '@renderer/hooks/useAuthSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbBell from '@renderer/assets/images/tb-bell.svg?react'

import { Notification } from './Notification'

const NotificationsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'notifications' })
  const { notifications } = useNotificationsSelector()

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbBell aria-hidden />}
      contentClassName="flex flex-col items-center p-0"
    >
      {notifications.length === 0 ? (
        <Fragment>
          <TbBell className="mt-20 h-28 w-28 stroke-1 text-gray-300" aria-hidden />
          <p className="font-sans-medium mt-7 text-lg text-white">{t('emptyListTitle')}</p>
          <p className="font-sans-regular mt-3.5 text-sm text-gray-100">{t('emptyListBody')}</p>
        </Fragment>
      ) : (
        <ul className="w-full grow overflow-auto">
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

export default NotificationsModal
