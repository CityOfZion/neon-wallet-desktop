import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router-dom'
import BsCash from '@renderer/assets/images/bs-cash.svg?react'
import MdOutlineListAlt from '@renderer/assets/images/md-outline-list-alt.svg?react'
import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbDeviceMobile from '@renderer/assets/images/tb-device-mobile.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'

import { SettingsSidebarLink } from './SettingsSidebarLink'

export const SettingsPersonalizationTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })

  const matchRootNetworkConfiguration = useMatch('app/settings/personalisation')
  const matchRootSettings = useMatch('app/settings')

  return (
    <nav className="mb-5 flex h-15 w-full flex-row justify-between text-[14px]">
      <ul className="w-full max-w-full">
        <SettingsSidebarLink
          title={t('personalisationOption.networkConfiguration')}
          icon={<TbCube3dSphere aria-hidden={true} />}
          to="/app/settings/personalisation/network-configuration"
          match={!!matchRootNetworkConfiguration || !!matchRootSettings}
        />
        <SettingsSidebarLink
          title={t('personalisationOption.language')}
          icon={<TbMessage />}
          to="/app/settings/personalisation/language"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.currency')}
          icon={<BsCash />}
          to="/app/settings/personalisation/currency"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.releaseNotes')}
          icon={<MdOutlineListAlt />}
          to="/app/settings/personalisation/release-notes"
        />
        <SettingsSidebarLink
          title={t('personalisationOption.mobileApp')}
          icon={<TbDeviceMobile />}
          to="/app/settings/personalisation/mobile-app"
        />
      </ul>
    </nav>
  )
}
