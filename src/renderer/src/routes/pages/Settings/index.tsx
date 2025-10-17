import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { Tabs } from '@renderer/components/Tabs'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import { MainLayout } from '@renderer/layouts/Main'

import { SettingsPersonalizationTabContent } from './SettingsPersonalizationTabContent'
import { SettingsSecurityTabContent } from './SettingsSecurityTabContent'

enum ESettingsOptions {
  PERSONALISATION = 'PERSONALISATION',
  SECURITY = 'SECURITY',
}

const SettingsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tabValue = pathname.includes('/personalisation') ? ESettingsOptions.PERSONALISATION : ESettingsOptions.SECURITY

  const handlePersonalisationClick = () => {
    navigate('/settings/personalisation/network-configuration')
  }

  const handleSecurityClick = () => {
    if (currentLoginSession?.type !== 'password') {
      navigate('/settings/security/encrypt-key')
      return
    }

    navigate('/settings/security/change-password/1')
  }

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <section className="flex h-full w-full rounded-sm bg-gray-800">
        <div className="flex max-w-70 min-w-70 flex-col items-center border-r border-gray-300/15 px-5">
          <Tabs.Root value={tabValue} className="w-full">
            <Tabs.List className="mt-2.5 mb-7 w-full">
              <Tabs.Trigger
                value={ESettingsOptions.PERSONALISATION}
                className="px-6"
                onClick={handlePersonalisationClick}
              >
                {t('sidebarOption.personalisation')}
              </Tabs.Trigger>

              <Tabs.Trigger
                value={ESettingsOptions.SECURITY}
                className="px-6"
                onClick={handleSecurityClick}
                {...TestHelper.buildTestObject('settings-tab-security')}
              >
                {t('sidebarOption.security')}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={ESettingsOptions.PERSONALISATION}>
              <SettingsPersonalizationTabContent />
            </Tabs.Content>
            <Tabs.Content value={ESettingsOptions.SECURITY}>
              <SettingsSecurityTabContent />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <div className="grow overflow-y-auto">
          <Outlet />
        </div>
      </section>
    </MainLayout>
  )
}

export default SettingsPage
