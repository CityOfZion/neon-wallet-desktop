import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '@renderer/components/Tabs'
import { useAppSelector } from '@renderer/hooks/useRedux'

export enum WelcomeTabItemType {
  NEON_ACCOUNT = 'neon-account',
  HARDWARE_WALLET = 'hardware-wallet',
  ADDRESS_OR_KEY = 'address-or-key',
}

type TProps = {
  defaultValue: WelcomeTabItemType
}

export const WelcomeTabs = ({ defaultValue }: TProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('layouts', { keyPrefix: 'welcomeWithTabs.tabs' })
  const { value: securityType } = useAppSelector(state => state.settings.securityType)

  return (
    <Tabs.Root defaultValue={defaultValue} className={'w-full'}>
      <Tabs.List className={'w-full mt-6 mb-9'}>
        <Tabs.Trigger
          value={WelcomeTabItemType.NEON_ACCOUNT}
          className={'uppercase'}
          onClick={() => navigate(securityType === 'none' ? '/neon-account' : '/login')}
        >
          {t('neonAccount')}
        </Tabs.Trigger>

        {/*TODO: remove this menu item comment when it was implemented*/}
        {/*<Tabs.Trigger*/}
        {/*  value={WelcomeTabItemType.HARDWARE_WALLET}*/}
        {/*  className={'uppercase'}*/}
        {/*  onClick={() => navigate('/hardware-wallet')}*/}
        {/*>*/}
        {/*  {t('hardwareWallet')}*/}
        {/*</Tabs.Trigger>*/}

        {/*TODO: remove this menu item comment when it was implemented*/}
        {/*<Tabs.Trigger*/}
        {/*  value={WelcomeTabItemType.ADDRESS_OR_KEY}*/}
        {/*  className={'uppercase'}*/}
        {/*  onClick={() => navigate('/address-or-key')}*/}
        {/*>*/}
        {/*  {t('addressOrKey')}*/}
        {/*</Tabs.Trigger>*/}
      </Tabs.List>
    </Tabs.Root>
  )
}
