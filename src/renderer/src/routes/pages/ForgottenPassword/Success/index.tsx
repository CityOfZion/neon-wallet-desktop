import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@renderer/components/Link'
import { SuccessIcon } from '@renderer/components/SuccessIcon'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { WelcomeLayout } from '@renderer/layouts/Welcome'

export const ForgottenPasswordSuccessPage: React.FC = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPasswordSuccess' })

  return (
    <WelcomeLayout heading={t('title')}>
      <div className="flex flex-col h-full text-center gap-y-6 items-center max-w-[280px]">
        <SuccessIcon />

        <p className="text-white text-xl">{t('text')}</p>
        <p className="text-gray-300 text-sm flex-grow">{t('description')}</p>

        <Link
          to="/neon-account"
          label={t('goToWelcome')}
          colorSchema="neon"
          variant="contained"
          className="w-full max-w-[250px] mx-auto"
          {...TestHelper.buildTestObject('forgotten-password-success-go-to-welcome')}
        />
      </div>
    </WelcomeLayout>
  )
}
