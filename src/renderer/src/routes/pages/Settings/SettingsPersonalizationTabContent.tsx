import { useTranslation } from 'react-i18next'
import { BsCash } from 'react-icons/bs'
import { MdOutlineListAlt } from 'react-icons/md'
import { Tb3DCubeSphere, TbDeviceMobile } from 'react-icons/tb'
import { useMatch } from 'react-router-dom'

import { SettingsSidebarLink } from './SettingsSidebarLink'

export const SettingsPersonalizationTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })

  const matchRootNetworkConfiguration = useMatch('app/settings/personalisation')
  const matchRootSettings = useMatch('app/settings')

  return (
    <nav className="flex flex-row justify-between h-15 w-full mb-5 text-[14px]">
      <ul className="max-w-full w-full">
        <SettingsSidebarLink
          title={t('personalisationOption.networkConfiguration')}
          icon={<Tb3DCubeSphere />}
          to="/app/settings/personalisation/network-configuration"
          match={!!matchRootNetworkConfiguration || !!matchRootSettings}
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
