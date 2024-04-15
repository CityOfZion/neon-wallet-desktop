import { useTranslation } from 'react-i18next'
import { TbDeviceMobile, TbDoorExit, TbHome2, TbSettings, TbStepInto, TbStepOut, TbUsers } from 'react-icons/tb'
import { useLogin } from '@renderer/hooks/useLogin'

import { ReactComponent as NeonLogoIcon } from '../../assets/images/neon-wallet-compact.svg'
import { ReactComponent as WalletIcon } from '../../assets/images/wallet-icon.svg'

import { SidebarButton } from './SidebarButton'
import { SidebarLink } from './SidebarLink'

export const Sidebar = (): JSX.Element => {
  const { t } = useTranslation('components', { keyPrefix: 'sidebar' })
  const { logout } = useLogin()
  return (
    <aside className="bg-gray-800 h-screen w-[4rem] min-w-[4rem] flex flex-col">
      <div className="flex justify-center pt-4 pb-2">
        <NeonLogoIcon className="border border-green rounded p-1" />
      </div>

      <nav className="flex-grow">
        <ul className="flex flex-col justify-between h-full">
          <div>
            <SidebarLink to="/app/portfolio" title={t('portfolio')} icon={<TbHome2 />} />
            <SidebarLink to="/app/wallets" title={t('wallets')} icon={<WalletIcon />} />
            <SidebarLink to="/app/send" title={t('send')} icon={<TbStepOut />} />
            <SidebarLink to="/app/receive" title={t('receive')} icon={<TbStepInto />} />
            <SidebarLink to="/app/contacts" title={t('contacts')} icon={<TbUsers />} />
            <SidebarLink to="/app/settings" title={t('settings')} icon={<TbSettings />} />
            <SidebarLink to="/app/mobile" title={t('mobile')} disabled isNew icon={<TbDeviceMobile />} />
          </div>

          <SidebarButton onClick={logout} title={t('logout')} icon={<TbDoorExit />} />
        </ul>
      </nav>
    </aside>
  )
}
