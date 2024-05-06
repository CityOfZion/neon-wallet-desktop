import { useTranslation } from 'react-i18next'
import { ReactComponent as AppStore } from '@renderer/assets/images/appstore.svg'
import PlayStore from '@renderer/assets/images/playstore.png'
import { MOBILE_APP_APPSTORE_LINK, MOBILE_APP_PLAYSTORE_LINK } from '@renderer/constants/urls'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsMobileApp = () => {
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
        <span className="text-white block text-lg mb-2">{t('subtitle')}</span>
        <div className="flex flex-col text-xs text-gray-100 mb-8">
          <span>{t('descriptionLine1')}</span>
          <span>{t('descriptionLine2')}</span>
        </div>
        <div className="flex items-center">
          <AppStore className="w-[10rem] h-[3rem]" onClick={appstoreClick} />
          <div className="w-5 h-12 flex justify-center mx-5">
            <div className="w-px h-full bg-gray-300/30" />
          </div>
          <img src={PlayStore} className="w-[11rem]" onClick={playstoreClick} />
        </div>
      </div>
    </SettingsLayout>
  )
}
