import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsChangePasswordPage = (): JSX.Element => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword' })

  return (
    <SettingsLayout title={t('title')}>
      <Outlet />
    </SettingsLayout>
  )
}
