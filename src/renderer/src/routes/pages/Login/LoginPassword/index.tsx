import { useHasPasswordSelector } from '@renderer/hooks/useSettingsSelector'

import { LoginPasswordFormContent } from './LoginPasswordFormContent'
import { LoginPasswordWelcomeContent } from './LoginPasswordWelcomeContent'

const LoginPasswordPage = () => {
  const { hasPassword } = useHasPasswordSelector()

  return hasPassword ? <LoginPasswordFormContent /> : <LoginPasswordWelcomeContent />
}

export default LoginPasswordPage
