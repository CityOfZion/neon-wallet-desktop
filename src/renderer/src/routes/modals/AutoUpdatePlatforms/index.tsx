import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import AppStore from '@renderer/assets/images/appstore.svg?react'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import playStoreImage from '@renderer/assets/images/playstore.png'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

const AutoUpdatePlatforms = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'autoUpdate.platforms' })
  const { modalEraseWrapper } = useModalNavigate()

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between" size="lg">
      <div className="flex flex-col items-center px-8 text-center">
        <NeonWalletLogo aria-hidden className="h-min w-56" />

        <h2 className="mt-11 text-2xl text-white">{t('title')}</h2>

        <p className="mt-7 w-full max-w-148 text-sm leading-5 text-gray-100">{t('description')}</p>

        <div className="mt-14 flex gap-x-6">
          <div className="flex flex-col items-center gap-y-3">
            <div className="flex items-center gap-x-2">
              <TbExternalLink aria-hidden className="text-blue max-size-5 min-size-5 size-5" />
              <span className="text-lg whitespace-nowrap text-white">{t('downloadForIOS')}</span>
            </div>

            <a
              aria-label={t('downloadForIOS')}
              href={ConstantsHelper.mobileAppStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
            >
              <AppStore aria-hidden className="mx-auto h-12 w-40" />
            </a>
          </div>

          <Separator type="vertical" className="bg-gray-300/30" />

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-x-2">
              <TbExternalLink aria-hidden className="text-blue max-size-5 min-size-5 size-5" />
              <span className="text-lg whitespace-nowrap text-white">{t('downloadForAndroid')}</span>
            </div>

            <a
              href={ConstantsHelper.mobilePlayStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              aria-label={t('downloadForAndroid')}
            >
              <img src={playStoreImage} aria-hidden className="mx-auto w-46" alt={t('downloadForAndroid')} />
            </a>
          </div>

          <Separator type="vertical" className="bg-gray-300/30" />

          <div className="flex flex-col items-center gap-y-3">
            <div className="flex items-center gap-x-2">
              <TbExternalLink aria-hidden className="text-blue max-size-5 min-size-5 size-5" />
              <span className="text-lg whitespace-nowrap text-white">{t('downloadForBrowser')}</span>
            </div>

            <Link
              label={t('extensionButtonLabel')}
              to={ConstantsHelper.extensionLatestReleaseUrl}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              colorSchema="neon"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-center">
        <Button
          label={t('buttonContinueLabel')}
          className="w-full max-w-56"
          iconsOnEdge={false}
          rightIcon={<TbArrowRight aria-hidden />}
          onClick={modalEraseWrapper()}
        />
      </div>
    </CenterModalLayout>
  )
}

export default AutoUpdatePlatforms
