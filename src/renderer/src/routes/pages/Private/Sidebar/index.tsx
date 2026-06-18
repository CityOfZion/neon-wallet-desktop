import { motion } from 'motion/react'
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

import { SidebarLink } from './SidebarLink'

type TProps = ComponentProps<typeof motion.aside>

export const Sidebar = ({ className, ...props }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { logout } = useLogin()

  return (
    <motion.aside
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0, width: 0, x: -64, minWidth: 0 }}
      transition={{ duration: 0.3 }}
      className={StyleHelper.mergeStyles('flex h-full w-16 min-w-16 flex-col bg-gray-800 drop-shadow-lg', className)}
      {...props}
    >
      <div className="flex justify-center py-4" {...TestHelper.buildTestObject('neon-wallet-logo')}>
        <NeonLogoIcon title={tCommon('logo')} />
      </div>

      <nav className="grow">
        <ul className="flex h-full flex-col">
          <SidebarLink to="/portfolio" iconElement={<TbHome2 aria-hidden />}>
            {t('portfolio')}
          </SidebarLink>

          <SidebarLink
            to="/wallets"
            iconElement={<WalletIcon aria-hidden />}
            {...TestHelper.buildTestObject('sidebar-link-wallets')}
          >
            {t('wallets')}
          </SidebarLink>

          <SidebarLink to="/send" iconElement={<TbStepOut aria-hidden />}>
            {t('send')}
          </SidebarLink>

          <SidebarLink to="/receive" iconElement={<TbStepInto aria-hidden />}>
            {t('receive')}
          </SidebarLink>

          <SidebarLink to="/swap" iconElement={<TbReplace aria-hidden />}>
            {t('swap')}
          </SidebarLink>

          <SidebarLink
            to="/buy-and-sell-tokens"
            iconElement={<TbShoppingBag aria-hidden />}
            {...TestHelper.buildTestObject('sidebar-link-buy-and-sell-tokens')}
          >
            {t('buyAndSellTokens')}
          </SidebarLink>

          <SidebarLink
            to="/contacts"
            iconElement={<TbUsers aria-hidden />}
            {...TestHelper.buildTestObject('sidebar-link-contacts')}
          >
            {t('contacts')}
          </SidebarLink>

          <SidebarLink
            to="/settings"
            iconElement={<TbSettings aria-hidden />}
            {...TestHelper.buildTestObject('sidebar-settings')}
          >
            {t('settings')}
          </SidebarLink>

          <SidebarLink
            className="mt-auto"
            to="/login"
            onClick={logout}
            iconElement={<TbDoorExit aria-hidden />}
            {...TestHelper.buildTestObject('logout-button')}
          >
            {t('logout')}
          </SidebarLink>
        </ul>
      </nav>
    </motion.aside>
  )
}
