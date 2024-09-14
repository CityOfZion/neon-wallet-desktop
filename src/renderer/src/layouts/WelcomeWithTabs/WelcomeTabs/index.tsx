import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '@renderer/components/Tabs'

export enum WelcomeTabItemType {
  NEON_ACCOUNT = 'neon-account',
  HARDWARE_WALLET = 'hardware-wallet',
  ADDRESS_OR_KEY = 'address-or-key',
}

type TabItem = {
  text: string
  url: string
  type: WelcomeTabItemType
}

const tabItems: TabItem[] = [
  {
    text: 'neonAccount',
    url: '/neon-account',
    type: WelcomeTabItemType.NEON_ACCOUNT,
  },
  // TODO: remove this menu item comment when it was implemented
  // {
  //   text: 'hardwareWallet',
  //   url: '/hardware-wallet',
  //   type: WelcomeTabItemType.HARDWARE_WALLET,
  // },
  // TODO: remove this menu item comment when it was implemented
  // {
  //   text: 'addressOrKey',
  //   url: '/address-or-key',
  //   type: WelcomeTabItemType.ADDRESS_OR_KEY,
  // },
]

type TProps = {
  defaultValue: WelcomeTabItemType
}

export const WelcomeTabs: React.FC<TProps> = ({ defaultValue }) => {
  const navigate = useNavigate()
  const { t } = useTranslation('layouts', { keyPrefix: 'welcomeWithTabs.tabs' })

  const handleTab = (url: string) => navigate(url)

  return (
    <Tabs.Root defaultValue={defaultValue} className={'w-full'}>
      <Tabs.List className={'w-full mt-6 mb-9'}>
        {tabItems.map(({ text, url, type }) => (
          <Tabs.Trigger key={type} value={type} className={'uppercase'} onClick={() => handleTab(url)}>
            {t(text)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
