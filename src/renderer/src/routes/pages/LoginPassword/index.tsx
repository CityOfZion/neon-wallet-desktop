import { Navigate } from 'react-router-dom'
import { useHasPasswordSelector, useIsFirstTimeSelector } from '@renderer/hooks/useSettingsSelector'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'

import { LoginPasswordFormContent } from './LoginPasswordFormContent'
import { LoginPasswordWelcomeContent } from './LoginPasswordWelcomeContent'

export const LoginPasswordPage = () => {
  const { isFirstTime } = useIsFirstTimeSelector()
  const { hasPassword } = useHasPasswordSelector()

  if (isFirstTime) {
    return <Navigate to="/welcome" />
  }

  return (
    <WelcomeWithTabsLayout tabItemSelected="password">
      {hasPassword ? <LoginPasswordFormContent /> : <LoginPasswordWelcomeContent />}
    </WelcomeWithTabsLayout>
  )
}
