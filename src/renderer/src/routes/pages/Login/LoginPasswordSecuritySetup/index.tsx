import { useTranslation } from 'react-i18next'
import { Outlet, useMatch } from 'react-router'

import { Stepper } from '@renderer/components/Stepper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

const LoginPasswordSecuritySetupPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup' })

  const match = useMatch('/:path/:currentStep')
  const currentStep = match ? Number(match.params.currentStep) : 1

  return (
    <WelcomeLayout heading={t('title')} withBackButton={currentStep !== undefined && currentStep < 3}>
      <Stepper steps={t('steps', { returnObjects: true })} className="my-14" currentStep={currentStep} />
      <Outlet />
    </WelcomeLayout>
  )
}

export default LoginPasswordSecuritySetupPage
