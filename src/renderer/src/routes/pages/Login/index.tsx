import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Tabs } from '@renderer/components/Tabs'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { LoginHardwareTabContent } from './LoginHardware'
import { LoginKeyTabContent } from './LoginKey'
import { LoginPasswordTabContent } from './LoginPassword'
import { LoginWebAuthTabContent } from './LoginWebAuth'

type TParams = {
  loginType?: string
}

const LoginPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'login' })
  const navigate = useNavigate()

  const { loginType } = useParams<TParams>()

  return (
    <WelcomeLayout heading={t('title')}>
      <Tabs.Root value={loginType || 'password'} className="w-full grow">
        <Tabs.List className="mt-6 mb-9 w-full">
          <Tabs.Trigger value="password" className="uppercase" onClick={() => navigate('/login/password')}>
            {t('tabs.password')}
          </Tabs.Trigger>

          <Tabs.Trigger value="hardware" className="uppercase" onClick={() => navigate('/login/hardware')}>
            {t('tabs.hardware')}
          </Tabs.Trigger>

          <Tabs.Trigger
            value="key"
            className="uppercase"
            onClick={() => navigate('/login/key')}
            {...TestHelper.buildTestObject('welcome-tab-key')}
          >
            {t('tabs.key')}
          </Tabs.Trigger>

          <Tabs.Trigger value="web-auth" className="uppercase" onClick={() => navigate('/login/web-auth')}>
            Web Auth
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content>
          <Tabs.Item value="password">
            <LoginPasswordTabContent />
          </Tabs.Item>

          <Tabs.Item value="hardware">
            <LoginHardwareTabContent />
          </Tabs.Item>

          <Tabs.Item value="key">
            <LoginKeyTabContent />
          </Tabs.Item>

          <Tabs.Item value="web-auth">
            <LoginWebAuthTabContent />
          </Tabs.Item>
        </Tabs.Content>
      </Tabs.Root>
    </WelcomeLayout>
  )
}

export default LoginPage
