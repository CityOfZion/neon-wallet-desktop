import { useLocation, useNavigate } from 'react-router-dom'

import { WelcomeSecuritySetupStep1Page } from '../SecuritySetup/Step1'

export const WelcomeImportWalletStep1Page = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (password: string) => {
    navigate('/welcome-import-wallet/2', { state: { password, ...state } })
  }

  return <WelcomeSecuritySetupStep1Page onSubmit={handleSubmit} />
}
