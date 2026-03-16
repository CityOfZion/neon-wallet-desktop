import { cloneElement } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate, useOutlet } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { Tabs } from '@renderer/components/Tabs'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import { MainLayout } from '@renderer/layouts/Main'

import { SettingsPersonalizationTabContent } from './SettingsPersonalizationTabContent'
import { SettingsSecurityTabContent } from './SettingsSecurityTabContent'

const SettingsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const { loginSession } = useLoginSessionSelector()
  const navigate = useNavigate()
  const outlet = useOutlet()

  const match = useMatch('/:path/:tab/*')

  const handlePersonalisationClick = () => {
    navigate('/settings/personalisation/network-configuration')
  }

  const handleSecurityClick = () => {
    if (loginSession?.type !== 'password') {
      navigate('/settings/security/encrypt-key')
      return
    }

    navigate('/settings/security/change-password/1')
  }

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <section className="flex h-full w-full rounded-sm bg-gray-800">
        <div className="flex max-w-70 min-w-70 flex-col items-center border-r border-gray-300/15 px-5">
          <Tabs.Root value={match?.params.tab || 'personalisation'} className="w-full">
            <Tabs.List className="mt-2.5 mb-7 w-full">
              <Tabs.Trigger value="personalisation" className="px-6" onClick={handlePersonalisationClick}>
                {t('sidebarOption.personalisation')}
              </Tabs.Trigger>

              <Tabs.Trigger
                value="security"
                className="px-6"
                onClick={handleSecurityClick}
                {...TestHelper.buildTestObject('settings-tab-security')}
              >
                {t('sidebarOption.security')}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content>
              <Tabs.Item value="personalisation">
                <SettingsPersonalizationTabContent />
              </Tabs.Item>

              <Tabs.Item value="security">
                <SettingsSecurityTabContent />
              </Tabs.Item>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <div className="grow overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={match?.params.tab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {outlet && cloneElement(outlet)}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </MainLayout>
  )
}

export default SettingsPage
