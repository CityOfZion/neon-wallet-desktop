import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Banner } from '@renderer/components/Banner'
import { Swipe } from '@renderer/components/Swipe'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WelcomeLayout } from '@renderer/layouts/Welcome'
import { RootStore } from '@renderer/store/RootStore'

export const ForgottenPasswordConfirmPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPasswordConfirm' })
  const navigate = useNavigate()

  const clearData = async () => {
    await RootStore.persistor.purge()

    ToastHelper.success({ message: t('success') })

    navigate('/welcome')
  }

  return (
    <WelcomeLayout heading={t('title')} withBackButton className={'flex-col justify-between'}>
      <div className={'flex flex-col flex-grow gap-y-8 justify-center max-w-[370px]'}>
        <p className={'text-white text-xl text-center'}>{t('text')}</p>

        <Banner type={'warning'} message={t('alertCard.text')} textClassName={'py-4'} iconClassName={'text-pink'} />
      </div>

      <div className={'flex flex-col gap-y-4 justify-center items-center'}>
        <p className={'text-gray-300 text-xs'}>{t('auxiliarText')}</p>

        <Swipe text={t('swipe.text')} buttonAriaLabel={t('swipe.buttonAriaLabel')} onComplete={clearData} />
      </div>
    </WelcomeLayout>
  )
}
