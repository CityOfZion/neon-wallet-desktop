import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useMatch } from 'react-router'

import { Stepper } from '@renderer/components/Stepper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

const LoginPasswordImportWalletPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet' })
  const { state } = useLocation()

  const match = useMatch('/:path/:currentStep')
  const currentStep = match ? Number(match.params.currentStep) : 1

  const steps = t('steps', { returnObjects: true }) as string[]
  if (state?.isMigration) {
    steps[2] = t('migrationLabel')
  }

  return (
    <WelcomeLayout heading={t('title')} withBackButton={currentStep <= 3} className="overflow-hidden px-8">
      <Stepper steps={steps} className="my-10" currentStep={currentStep} />

      <div className="flex min-h-0 w-full grow flex-col items-center px-8">
        <Outlet />
      </div>
    </WelcomeLayout>
  )
}

export default LoginPasswordImportWalletPage
