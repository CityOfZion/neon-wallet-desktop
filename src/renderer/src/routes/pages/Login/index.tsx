import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { LoginTabs } from './LoginTabs'

const LoginPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'login' })

  return (
    <WelcomeLayout heading={t('title')}>
      <LoginTabs />
      <Outlet />
    </WelcomeLayout>
  )
}

export default LoginPage
