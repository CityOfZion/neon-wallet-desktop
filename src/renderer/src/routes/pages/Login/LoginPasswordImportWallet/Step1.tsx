import { useLocation, useNavigate } from 'react-router'

import { LoginPasswordSecuritySetupStep1Content } from '../LoginPasswordSecuritySetup/Step1'

export const LoginPasswordImportWalletStep1Content = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/login-import-wallet-setup/2', { state: { password, ...state } })
  }

  return <LoginPasswordSecuritySetupStep1Content onSubmit={handleSubmit} />
}
