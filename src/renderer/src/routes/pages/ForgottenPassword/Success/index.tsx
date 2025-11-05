import React from 'react'

import { useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'
import { SuccessIcon } from '@renderer/components/SuccessIcon'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

const ForgottenPasswordSuccessPage: React.FC = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPasswordSuccess' })

  return (
    <WelcomeLayout heading={t('title')}>
      <div className="flex h-full max-w-[280px] flex-col items-center gap-y-6 text-center">
        <SuccessIcon />

        <p className="text-xl text-white">{t('text')}</p>
        <p className="grow text-sm text-gray-300">{t('description')}</p>

        <Link
          to="/login/password"
          label={t('goToWelcome')}
          colorSchema="neon"
          variant="contained"
          className="mx-auto w-full max-w-[250px]"
          {...TestHelper.buildTestObject('forgotten-password-success-go-to-welcome')}
        />
      </div>
    </WelcomeLayout>
  )
}

export default ForgottenPasswordSuccessPage
