import { useLocation, useNavigate } from 'react-router'

import WelcomeSecuritySetupStep2Page from '../LoginPasswordSecuritySetup/Step2'

const LoginPasswordImportWalletStep2Page = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/login-import-wallet-setup/3', { state: { password, ...state } })
  }

  return <WelcomeSecuritySetupStep2Page onSubmit={handleSubmit} />
}

export default LoginPasswordImportWalletStep2Page
