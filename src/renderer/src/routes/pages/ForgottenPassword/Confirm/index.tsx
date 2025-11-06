import { useTransition } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Swipe } from '@renderer/components/Swipe'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useCurrencySelector, useIsFirstTimeSelector, useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { RootStore } from '@renderer/store/RootStore'

const ForgottenPasswordConfirmPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPasswordConfirm' })
  const navigate = useNavigate()
  const { language } = useLanguageSelector()
  const { currency } = useCurrencySelector()
  const { isFirstTime } = useIsFirstTimeSelector()
  const [isCleaningData, startCleaningData] = useTransition()

  const handleCleanData = async () => {
    if (isCleaningData) return

    startCleaningData(async () => {
      try {
        await RootStore.persistor.purge()

        RootStore.setupStore()

        await RootStore.waitForBootstrap()

        RootStore.store.dispatch(settingsReducerActions.setIsFirstTime(isFirstTime))
        RootStore.store.dispatch(settingsReducerActions.setLanguage(language))
        RootStore.store.dispatch(settingsReducerActions.setCurrency(currency))

        navigate('/forgotten-password/success')
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <WelcomeLayout heading={t('title')} withBackButton className="flex-col justify-between">
      <div className="flex max-w-[370px] grow flex-col justify-center gap-y-8">
        <p className="text-center text-xl text-white">{t('text')}</p>

        <Banner type="warning" message={t('alertCard.text')} textClassName="py-4" iconClassName="text-pink" />
      </div>

      <div className="flex flex-col items-center justify-center gap-y-4">
        <p className="text-xs text-gray-300">{t('auxiliarText')}</p>

        <Swipe
          text={t('swipe.text')}
          buttonAriaLabel={t('swipe.buttonAriaLabel')}
          isDisabled={isCleaningData}
          onComplete={handleCleanData}
          {...TestHelper.buildTestObject('forgotten-password-confirm')}
        />
      </div>
    </WelcomeLayout>
  )
}

export default ForgottenPasswordConfirmPage
