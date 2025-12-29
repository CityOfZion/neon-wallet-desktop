import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Stepper } from '@renderer/components/Stepper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { LoginPasswordSecuritySetupStep1Content } from './Step1'
import { LoginPasswordSecuritySetupStep2Content } from './Step2'
import { LoginPasswordSecuritySetupStep3Content } from './Step3'

type TParams = {
  step?: string
}

const LoginPasswordSecuritySetupPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup' })

  const { step } = useParams<TParams>()
  const currentStep = step ? Number(step) : 1

  return (
    <WelcomeLayout heading={t('title')} withBackButton={currentStep !== undefined && currentStep < 3}>
      <Stepper.Root className="h-full w-full" value={currentStep}>
        <Stepper.List className="my-10">
          <Stepper.Step value={1} label={t('passwordStep.label')} />
          <Stepper.Step value={2} label={t('confirmPasswordStep.label')} />
          <Stepper.Step value={3} label={t('completedStep.label')} />
        </Stepper.List>

        <Stepper.Content>
          <Stepper.Item value={1}>
            <LoginPasswordSecuritySetupStep1Content />
          </Stepper.Item>

          <Stepper.Item value={2}>
            <LoginPasswordSecuritySetupStep2Content />
          </Stepper.Item>

          <Stepper.Item value={3}>
            <LoginPasswordSecuritySetupStep3Content />
          </Stepper.Item>
        </Stepper.Content>
      </Stepper.Root>
    </WelcomeLayout>
  )
}

export default LoginPasswordSecuritySetupPage
