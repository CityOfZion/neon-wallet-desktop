import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router'

import { Stepper } from '@renderer/components/Stepper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { LoginPasswordImportWalletStep1Content } from './Step1'
import { LoginPasswordImportWalletStep2Content } from './Step2'
import { LoginPasswordImportWalletStep3Content } from './Step3'
import { LoginPasswordImportWalletStep4Content } from './Step4'
import { LoginPasswordImportWalletStep5Content } from './Step5'

type TParams = {
  step?: string
}

const LoginPasswordImportWalletPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet' })
  const { t: securitySetupT } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup' })

  const { state } = useLocation()
  const { step } = useParams<TParams>()

  const currentStep = step ? Number(step) : 1

  return (
    <WelcomeLayout heading={t('title')} withBackButton={currentStep <= 3} className="overflow-hidden px-8">
      <Stepper.Root className="h-full w-full" value={currentStep}>
        <Stepper.List className="my-10">
          <Stepper.Step value={1} label={securitySetupT('passwordStep.label')} />
          <Stepper.Step value={2} label={securitySetupT('confirmPasswordStep.label')} />
          <Stepper.Step value={3} label={state?.isMigration ? t('migrationStep.label') : t('keyStep.label')} />
          <Stepper.Step value={4} label={t('importStep.label')} />
          <Stepper.Step value={5} label={t('completedStep.label')} />
        </Stepper.List>

        <Stepper.Content className="items-center px-8">
          <Stepper.Item value={1}>
            <LoginPasswordImportWalletStep1Content />
          </Stepper.Item>

          <Stepper.Item value={2}>
            <LoginPasswordImportWalletStep2Content />
          </Stepper.Item>

          <Stepper.Item value={3}>
            <LoginPasswordImportWalletStep3Content />
          </Stepper.Item>

          <Stepper.Item value={4}>
            <LoginPasswordImportWalletStep4Content />
          </Stepper.Item>

          <Stepper.Item value={5}>
            <LoginPasswordImportWalletStep5Content />
          </Stepper.Item>
        </Stepper.Content>
      </Stepper.Root>
    </WelcomeLayout>
  )
}

export default LoginPasswordImportWalletPage
