import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Swipe } from '@renderer/components/Swipe'

import { ReduxHelper } from '@renderer/helpers/ReduxHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useCurrencySelector, useIsFirstTimeSelector, useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

const ForgottenPasswordConfirmPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPasswordConfirm' })
  const navigate = useNavigate()
  const { language } = useLanguageSelector()
  const { currency } = useCurrencySelector()
  const { isFirstTime } = useIsFirstTimeSelector()
  const [isCleaningData, startCleaningData] = usePressOnce(async () => {
    try {
      await ReduxHelper.persistor.purge()
      ReduxHelper.setup()
      await ReduxHelper.waitForBootstrap()

      ReduxHelper.store.dispatch(settingsReducerActions.setIsFirstTime(isFirstTime))
      ReduxHelper.store.dispatch(settingsReducerActions.setLanguage(language))
      ReduxHelper.store.dispatch(settingsReducerActions.setCurrency(currency))

      navigate('/forgotten-password/success')
    } catch (error) {
      console.error(error)
    }
  })

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
          onComplete={startCleaningData}
          {...TestHelper.buildTestObject('forgotten-password-confirm')}
        />
      </div>
    </WelcomeLayout>
  )
}

export default ForgottenPasswordConfirmPage
