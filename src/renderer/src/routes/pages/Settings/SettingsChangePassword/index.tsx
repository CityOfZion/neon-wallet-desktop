import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { SettingsLayout } from '@renderer/layouts/Settings'

const SettingsChangePasswordPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword' })

  return (
    <SettingsLayout title={t('title')}>
      <Outlet />
    </SettingsLayout>
  )
}

export default SettingsChangePasswordPage
