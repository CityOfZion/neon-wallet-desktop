import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { match, P } from 'ts-pattern'

import { Tabs } from '@renderer/components/Tabs'

import { TestHelper } from '@renderer/helpers/TestHelper'

export const LoginTabs = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('pages', { keyPrefix: 'login.tabs' })

  const value = match(location.pathname)
    .with(
      P.when(path => path.includes('/login/password')),
      () => 'password'
    )
    .with(
      P.when(path => path.includes('/login/hardware')),
      () => 'hardware'
    )
    .otherwise(() => 'key')

  return (
    <Tabs.Root value={value} className="w-full">
      <Tabs.List className="mt-6 mb-9 w-full">
        <Tabs.Trigger value="password" className="uppercase" onClick={() => navigate('/login/password')}>
          {t('password')}
        </Tabs.Trigger>

        <Tabs.Trigger value="hardware" className="uppercase" onClick={() => navigate('/login/hardware')}>
          {t('hardware')}
        </Tabs.Trigger>

        <Tabs.Trigger
          value="key"
          className="uppercase"
          onClick={() => navigate('/login/key')}
          {...TestHelper.buildTestObject('welcome-tab-key')}
        >
          {t('key')}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}
