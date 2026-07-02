import { useTranslation } from 'react-i18next'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { SettingsLayout } from '@renderer/layouts/Settings'

import AppStore from '@renderer/assets/images/appstore.svg?react'
import PlayStore from '@renderer/assets/images/playstore.png'

const SettingsMobileApp = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsMobileApp' })

  return (
    <SettingsLayout title={t('title')} contentClassName="overflow-y-auto">
      <div>
        <span className="mb-2 block text-lg text-white">{t('subtitle')}</span>
        <div className="mb-8 flex flex-col text-xs text-gray-100">
          <span>{t('descriptionLine1')}</span>
          <span>{t('descriptionLine2')}</span>
        </div>

        <div className="flex items-center">
          <a
            href={ConstantsHelper.mobileAppStoreUrl}
            aria-label={t('appStoreImageLabel')}
            target="_blank"
            rel="noreferrer"
          >
            <AppStore aria-hidden className="h-12 w-40 cursor-pointer" />
          </a>

          <div className="mx-5 flex h-12 w-5 justify-center">
            <div className="h-full w-px bg-gray-300/30" />
          </div>

          <a
            href={ConstantsHelper.mobilePlayStoreUrl}
            aria-label={t('playStoreImageLabel')}
            target="_blank"
            rel="noreferrer"
          >
            <img src={PlayStore} alt="" aria-hidden className="w-44 cursor-pointer" />
          </a>
        </div>
      </div>
    </SettingsLayout>
  )
}

export default SettingsMobileApp
