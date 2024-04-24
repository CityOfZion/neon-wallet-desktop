import { useTranslation } from 'react-i18next'
import { MdLaunch } from 'react-icons/md'
import { TbArrowRight } from 'react-icons/tb'
import { ReactComponent as AppStoreBanner } from '@renderer/assets/images/app-store-banner.svg'
import { ReactComponent as GooglePlayBanner } from '@renderer/assets/images/google-play-banner.svg'
import { ReactComponent as NeonWalletLogo } from '@renderer/assets/images/neon-wallet-full.svg'
import { Button } from '@renderer/components/Button'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

export const DownloadWalletMobileModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'downloadWalletMobile' })
  const { modalNavigate } = useModalNavigate()

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between" size="lg">
      <div className="text-center px-8 flex flex-col items-center">
        <NeonWalletLogo className="w-56 h-min" />
        <h2 className="text-2xl text-white mt-11">{t('title')}</h2>

        <p className="mt-7 text-gray-100 text-sm leading-5 w-full max-w-[37rem]">{t('description')}</p>

        <div className="flex gap-x-4 mt-14">
          <div className="flex flex-col items-center">
            <div className="flex gap-x-4">
              <a href={t('iosLink')} target="_blank" rel="noreferrer">
                <MdLaunch className="text-blue w-6 h-6" />
              </a>
              <span className="text-white text-lg">{t('downloadForIOS')}</span>
            </div>
            <AppStoreBanner className="ml-14 w-[11.5rem]" />
          </div>
          <div className="w-px bg-gray-300/30 h-full"></div>
          <div className="flex flex-col items-center">
            <div className="flex gap-x-4">
              <a href={t('androidLink')} target="_blank" rel="noreferrer">
                <MdLaunch className="text-blue w-6 h-6" />
              </a>
              <span className="text-white text-lg">{t('downloadForAndroid')}</span>
            </div>
            <GooglePlayBanner className="ml-5 w-[11.5rem]" />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-center gap-x-2">
        <Button
          label={t('buttonContinueLabel')}
          iconsOnEdge={false}
          rightIcon={<TbArrowRight />}
          className="w-full max-w-56"
          onClick={() => modalNavigate(-2)}
        />
      </div>
    </CenterModalLayout>
  )
}
