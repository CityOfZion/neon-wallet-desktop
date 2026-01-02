import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import AppStore from '@renderer/assets/images/appstore.svg?react'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import PlayStore from '@renderer/assets/images/playstore.png'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

const AutoUpdateMobile = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'autoUpdate.mobile' })
  const { modalEraseWrapper } = useModalNavigate()

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between" size="lg">
      <div className="flex flex-col items-center px-8 text-center">
        <NeonWalletLogo aria-hidden className="h-min w-56" />

        <h2 className="mt-11 text-2xl text-white">{t('title')}</h2>

        <p className="mt-7 w-full max-w-148 text-sm leading-5 text-gray-100">{t('description')}</p>

        <div className="mt-14 flex gap-x-4">
          <div className="flex flex-col items-center">
            <div className="flex gap-x-4">
              <TbExternalLink aria-hidden className="text-blue h-6 w-6" />
              <span className="text-lg text-white">{t('downloadForIOS')}</span>
            </div>

            <a
              href={ConstantsHelper.mobileAppStoreUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t('downloadForIOS')}
            >
              <AppStore aria-hidden className="mt-3 ml-11 h-12 w-40 cursor-pointer" />
            </a>
          </div>
          <div className="h-full w-px bg-gray-300/30"></div>
          <div className="flex flex-col items-center">
            <div className="flex gap-x-4">
              <TbExternalLink aria-hidden className="text-blue h-6 w-6" />
              <span className="text-lg text-white">{t('downloadForAndroid')}</span>
            </div>

            <a
              href={ConstantsHelper.mobilePlayStoreUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t('downloadForAndroid')}
            >
              <img src={PlayStore} aria-hidden className="ml-5 w-46 cursor-pointer" alt={t('downloadForAndroid')} />
            </a>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-center gap-x-2">
        <Button
          label={t('buttonContinueLabel')}
          iconsOnEdge={false}
          rightIcon={<TbArrowRight />}
          className="w-full max-w-56"
          onClick={modalEraseWrapper()}
        />
      </div>
    </CenterModalLayout>
  )
}

export default AutoUpdateMobile
