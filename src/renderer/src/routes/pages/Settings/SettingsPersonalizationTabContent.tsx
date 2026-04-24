import { useTranslation } from 'react-i18next'

import { MenuLink } from '@renderer/components/MenuLink'

import { TestHelper } from '@renderer/helpers/TestHelper'

import BsCash from '@renderer/assets/images/bs-cash.svg?react'
import MdOutlineListAlt from '@renderer/assets/images/md-outline-list-alt.svg?react'
import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbDeviceMobile from '@renderer/assets/images/tb-device-mobile.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'

export const SettingsPersonalizationTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })

  return (
    <nav className="mb-5 flex h-15 w-full flex-row justify-between text-[14px]">
      <ul className="flex w-full max-w-full flex-col gap-3">
        <li>
          <MenuLink
            layoutId="settings-personalisation"
            iconElement={<TbCube3dSphere aria-hidden />}
            className="px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/personalisation/network-configuration"
            {...TestHelper.buildTestObject('settings-network-configuration-link')}
          >
            {t('personalisationOption.networkConfiguration')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-personalisation"
            className="px-3 py-2 text-sm"
            rightElement={null}
            iconElement={<TbMessage aria-hidden />}
            to="/settings/personalisation/language"
          >
            {t('personalisationOption.language')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-personalisation"
            className="px-3 py-2 text-sm"
            rightElement={null}
            iconElement={<BsCash aria-hidden />}
            to="/settings/personalisation/currency"
          >
            {t('personalisationOption.currency')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-personalisation"
            className="px-3 py-2 text-sm"
            rightElement={null}
            iconElement={<MdOutlineListAlt aria-hidden />}
            to="/settings/personalisation/release-notes"
          >
            {t('personalisationOption.releaseNotes')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-personalisation"
            iconElement={<TbDeviceMobile aria-hidden />}
            className="px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/personalisation/mobile-app"
          >
            {t('personalisationOption.mobileApp')}
          </MenuLink>
        </li>
      </ul>
    </nav>
  )
}
