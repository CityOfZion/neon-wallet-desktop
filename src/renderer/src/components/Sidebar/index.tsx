import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useLogin } from '@renderer/hooks/useLogin'

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

import { SidebarButton } from './SidebarButton'
import { SidebarLink } from './SidebarLink'

type TProps = ComponentProps<'aside'>

export const Sidebar = ({ className, ...props }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { logout } = useLogin()

  return (
    <aside
      className={StyleHelper.mergeStyles('flex h-full w-16 max-w-16 min-w-16 flex-col bg-gray-800', className)}
      {...props}
    >
      <div className="flex justify-center py-4" {...TestHelper.buildTestObject('neon-wallet-logo')}>
        <NeonLogoIcon title={tCommon('logo')} />
      </div>

      <nav className="grow">
        <ul className="flex h-full flex-col justify-between">
          <div>
            <SidebarLink to="/portfolio/overview" title={t('portfolio')} icon={<TbHome2 />} />

            <SidebarLink
              to="/wallets"
              title={t('wallets')}
              icon={<WalletIcon />}
              {...TestHelper.buildTestObject('sidebar-link-wallets')}
            />

            <SidebarLink to="/send" title={t('send')} icon={<TbStepOut />} />
            <SidebarLink to="/receive" title={t('receive')} icon={<TbStepInto />} />

            <SidebarLink to="/swap" title={t('swap')} icon={<TbReplace />} />

            <SidebarLink
              to="/buy-and-sell-tokens"
              title={t('buyAndSellTokens')}
              icon={<TbShoppingBag aria-hidden />}
              {...TestHelper.buildTestObject('sidebar-link-buy-and-sell-tokens')}
            />

            <SidebarLink
              to="/contacts"
              title={t('contacts')}
              icon={<TbUsers />}
              {...TestHelper.buildTestObject('sidebar-link-contacts')}
            />

            <SidebarLink
              to="/settings/personalisation/network-configuration"
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
