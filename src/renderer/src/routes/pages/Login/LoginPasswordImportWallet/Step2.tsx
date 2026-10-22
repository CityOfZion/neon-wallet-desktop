import { useLocation, useNavigate } from 'react-router'

import { LoginPasswordSecuritySetupStep2Content } from '../LoginPasswordSecuritySetup/Step2'

export const LoginPasswordImportWalletStep2Content = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/login-import-wallet-setup/3', { state: { password, ...state } })
  }

  return <LoginPasswordSecuritySetupStep2Content onSubmit={handleSubmit} />
}
