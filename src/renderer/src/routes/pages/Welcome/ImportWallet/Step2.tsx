import { useLocation, useNavigate } from 'react-router-dom'

import { WelcomeSecuritySetupStep2Page } from '../SecuritySetup/Step2'

export const WelcomeImportWalletStep2Page = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/welcome-import-wallet/3', { state: { password, ...state } })
  }

  return <WelcomeSecuritySetupStep2Page onSubmit={handleSubmit} />
}
