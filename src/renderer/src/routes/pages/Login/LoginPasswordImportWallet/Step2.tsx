import { useLocation } from 'react-router'

import { useNavigateReset } from '@renderer/hooks/useNavigateReset'

import { LoginPasswordSecuritySetupStep2Content } from '../LoginPasswordSecuritySetup/Step2'

export const LoginPasswordImportWalletStep2Content = () => {
  const navigateReset = useNavigateReset()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigateReset('/login-import-wallet-setup/3', { state: { password, ...state } })
  }

  return <LoginPasswordSecuritySetupStep2Content onSubmit={handleSubmit} />
}
