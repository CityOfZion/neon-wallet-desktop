import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Tabs } from '@renderer/components/Tabs'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { TLoginSessionType } from '@shared/@types/store'

type TProps = {
  defaultValue: TLoginSessionType
}

export const WelcomeTabs = ({ defaultValue }: TProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('layouts', { keyPrefix: 'welcomeWithTabs.tabs' })

  return (
    <Tabs.Root defaultValue={defaultValue} className="w-full">
      <Tabs.List className="w-full mt-6 mb-9">
        <Tabs.Trigger value="password" className="uppercase" onClick={() => navigate('/login-password')}>
          {t('password')}
        </Tabs.Trigger>

        <Tabs.Trigger value="hardware" className="uppercase" onClick={() => navigate('/login-hardware')}>
          {t('hardware')}
        </Tabs.Trigger>

        <Tabs.Trigger
          value="key"
          className="uppercase"
          onClick={() => navigate('/login-key')}
          {...TestHelper.buildTestObject('welcome-tab-key')}
        >
          {t('key')}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}
