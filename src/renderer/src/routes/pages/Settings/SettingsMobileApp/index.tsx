import { useTranslation } from 'react-i18next'

import { SettingsLayout } from '@renderer/layouts/Settings'

import AppStore from '@renderer/assets/images/appstore.svg?react'
import PlayStore from '@renderer/assets/images/playstore.png'

import { MOBILE_APP_APPSTORE_LINK, MOBILE_APP_PLAYSTORE_LINK } from '@renderer/constants/urls'

const SettingsMobileApp = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsMobileApp' })

  const appstoreClick = () => {
    window.open(MOBILE_APP_APPSTORE_LINK)
  }

  const playstoreClick = () => {
    window.open(MOBILE_APP_PLAYSTORE_LINK)
  }

  return (
    <SettingsLayout title={t('title')} contentClassName="overflow-y-auto">
      <div>
        <span className="mb-2 block text-lg text-white">{t('subtitle')}</span>
        <div className="mb-8 flex flex-col text-xs text-gray-100">
          <span>{t('descriptionLine1')}</span>
          <span>{t('descriptionLine2')}</span>
        </div>
        <div className="flex items-center">
          <AppStore className="h-12 w-40 cursor-pointer" onClick={appstoreClick} />
          <div className="mx-5 flex h-12 w-5 justify-center">
            <div className="h-full w-px bg-gray-300/30" />
          </div>
          <img src={PlayStore} className="w-44 cursor-pointer" onClick={playstoreClick} />
        </div>
      </div>
    </SettingsLayout>
  )
}

export default SettingsMobileApp
