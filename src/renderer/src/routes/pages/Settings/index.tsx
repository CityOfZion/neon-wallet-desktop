import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs } from '@renderer/components/Tabs'
import { useLoginSessionSelector } from '@renderer/hooks/useSettingsSelector'
import { MainLayout } from '@renderer/layouts/Main'

import { SettingsPersonalizationTabContent } from './SettingsPersonalizationTabContent'
import { SettingsSecurityTabContent } from './SettingsSecurityTabContent'

enum ESettingsOptions {
  PERSONALISATION = 'PERSONALISATION',
  SECURITY = 'SECURITY',
}

export const SettingsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const { loginSession } = useLoginSessionSelector()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [tabValue, setTabValue] = useState(ESettingsOptions.PERSONALISATION)

  const handlePersonalisationClick = () => {
    setTabValue(ESettingsOptions.PERSONALISATION)

    navigate('/app/settings/personalisation')
  }

  const handleSecurityClick = () => {
    setTabValue(ESettingsOptions.SECURITY)

    if (loginSession?.type === 'hardware') {
      navigate('/app/settings/security/encrypt-key')
      return
    }

    navigate('/app/settings/security')
  }

  useEffect(() => {
    if (pathname === '/app/settings') handlePersonalisationClick()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <MainLayout heading={t('title')}>
      <section className="bg-gray-800 w-full h-full flex rounded">
        <div className="min-w-[17.5rem] max-w-[17.5rem] px-5 border-r border-gray-300/15 flex flex-col items-center">
          <Tabs.Root value={tabValue} className="w-full">
            <Tabs.List className="w-full mt-2.5 mb-7">
              <Tabs.Trigger
                value={ESettingsOptions.PERSONALISATION}
                className="px-6"
                onClick={handlePersonalisationClick}
              >
                {t('sidebarOption.personalisation')}
              </Tabs.Trigger>
              <Tabs.Trigger value={ESettingsOptions.SECURITY} className="px-6" onClick={handleSecurityClick}>
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

        <div className="flex-grow">
          <Outlet />
        </div>
      </section>
    </MainLayout>
  )
}
