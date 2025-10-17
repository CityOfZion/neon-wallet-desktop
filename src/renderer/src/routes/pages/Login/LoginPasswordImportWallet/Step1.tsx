import { useLocation, useNavigate } from 'react-router'

import WelcomeSecuritySetupStep1Page from '../LoginPasswordSecuritySetup/Step1'

const LoginPasswordImportWalletStep1Page = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/login-import-wallet-setup/2', { state: { password, ...state } })
  }

  return <WelcomeSecuritySetupStep1Page onSubmit={handleSubmit} />
}

export default LoginPasswordImportWalletStep1Page
