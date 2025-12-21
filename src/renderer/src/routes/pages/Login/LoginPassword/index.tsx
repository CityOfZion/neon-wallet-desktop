import { useHasPasswordSelector } from '@renderer/hooks/useSettingsSelector'

import { LoginPasswordFormContent } from './LoginPasswordFormContent'
import { LoginPasswordWelcomeContent } from './LoginPasswordWelcomeContent'

export const LoginPasswordTabContent = () => {
  const { hasPassword } = useHasPasswordSelector()

  return hasPassword ? <LoginPasswordFormContent /> : <LoginPasswordWelcomeContent />
}
