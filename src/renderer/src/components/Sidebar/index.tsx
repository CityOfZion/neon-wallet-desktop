import { useTranslation } from 'react-i18next'
import { TbDoorExit, TbHome2, TbReplace, TbSettings, TbStepInto, TbStepOut, TbUsers } from 'react-icons/tb'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useLogin } from '@renderer/hooks/useLogin'

import NeonLogoIcon from '../../assets/images/neon-wallet-compact.svg?react'
import WalletIcon from '../../assets/images/wallet-icon.svg?react'

import { SidebarButton } from './SidebarButton'
import { SidebarLink } from './SidebarLink'

export const Sidebar = (): JSX.Element => {
  const { t } = useTranslation('components', { keyPrefix: 'sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { logout } = useLogin()

  return (
    <aside className="bg-gray-800 w-[4rem] min-w-[4rem] h-screen-minus-drag-region flex flex-col">
      <div className="flex justify-center py-4" {...TestHelper.buildTestObject('neon-wallet-logo')}>
        <NeonLogoIcon title={tCommon('logo')} />
      </div>

      <nav className="flex-grow">
        <ul className="flex flex-col justify-between h-full">
          <div>
            <SidebarLink to="/app/portfolio" title={t('portfolio')} icon={<TbHome2 />} />

            <SidebarLink
              to="/app/wallets"
              title={t('wallets')}
              icon={<WalletIcon />}
              {...TestHelper.buildTestObject('sidebar-link-wallets')}
            />

            <SidebarLink to="/app/send" title={t('send')} icon={<TbStepOut />} />
            <SidebarLink to="/app/receive" title={t('receive')} icon={<TbStepInto />} />

            <SidebarLink to="/app/swap" title={t('swap')} icon={<TbReplace />} />

            <SidebarLink
              to="/app/contacts"
              title={t('contacts')}
              icon={<TbUsers />}
              {...TestHelper.buildTestObject('sidebar-link-contacts')}
            />

            <SidebarLink
              to="/app/settings"
              title={t('settings')}
              icon={<TbSettings />}
              {...TestHelper.buildTestObject('sidebar-settings')}
            />
          </div>

          <SidebarButton
            onClick={logout}
            title={t('logout')}
            icon={<TbDoorExit />}
            {...TestHelper.buildTestObject('logout-button')}
          />
        </ul>
      </nav>
    </aside>
  )
}
