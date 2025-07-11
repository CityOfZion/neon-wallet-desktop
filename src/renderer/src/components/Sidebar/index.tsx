import { useTranslation } from 'react-i18next'
import NeonLogoIcon from '@renderer/assets/images/neon-wallet-compact.svg?react'
import TbDoorExit from '@renderer/assets/images/tb-door-exit.svg?react'
import TbHome2 from '@renderer/assets/images/tb-home-2.svg?react'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import TbSettings from '@renderer/assets/images/tb-settings.svg?react'
import TbShoppingBag from '@renderer/assets/images/tb-shopping-bag.svg?react'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'
import WalletIcon from '@renderer/assets/images/wallet-icon.svg?react'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useLogin } from '@renderer/hooks/useLogin'

import { SidebarButton } from './SidebarButton'
import { SidebarLink } from './SidebarLink'

export const Sidebar = (): JSX.Element => {
  const { t } = useTranslation('components', { keyPrefix: 'sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { logout } = useLogin()

  return (
    <aside className="flex h-screen-minus-drag-region w-[4rem] min-w-[4rem] flex-col bg-gray-800">
      <div className="flex justify-center py-4" {...TestHelper.buildTestObject('neon-wallet-logo')}>
        <NeonLogoIcon title={tCommon('logo')} />
      </div>

      <nav className="flex-grow">
        <ul className="flex h-full flex-col justify-between">
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
              to="/app/buy-and-sell-tokens"
              title={t('buyAndSellTokens')}
              icon={<TbShoppingBag aria-hidden={true} />}
              {...TestHelper.buildTestObject('sidebar-link-buy-and-sell-tokens')}
            />

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
