import { useTranslation } from 'react-i18next'

import BsCash from '@renderer/assets/images/bs-cash.svg?react'
import MdOutlineListAlt from '@renderer/assets/images/md-outline-list-alt.svg?react'
import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbDeviceMobile from '@renderer/assets/images/tb-device-mobile.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'

import { SettingsSidebarLink } from './SettingsSidebarLink'

export const SettingsPersonalizationTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })

  return (
    <nav className="mb-5 flex h-15 w-full flex-row justify-between text-[14px]">
      <ul className="w-full max-w-full">
        <SettingsSidebarLink
          title={t('personalisationOption.networkConfiguration')}
          icon={<TbCube3dSphere aria-hidden />}
          to="/settings/personalisation/network-configuration"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.language')}
          icon={<TbMessage />}
          to="/settings/personalisation/language"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.currency')}
          icon={<BsCash />}
          to="/settings/personalisation/currency"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.releaseNotes')}
          icon={<MdOutlineListAlt />}
          to="/settings/personalisation/release-notes"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.mobileApp')}
          icon={<TbDeviceMobile />}
          to="/settings/personalisation/mobile-app"
        />
      </ul>
    </nav>
  )
}
