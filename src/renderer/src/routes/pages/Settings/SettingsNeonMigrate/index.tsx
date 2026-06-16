import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { NeonMigrateSteps } from '@renderer/components/NeonMigrateSteps'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

const SettingsNeonMigratePage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNeonMigrate' })
  const { modalNavigateWrapper } = useModalNavigate()

  const openNeon2Click = () => {
    window.open('neon2://open')
  }

  return (
    <SettingsLayout title={t('title')} contentClassName="items-center">
      <div className="flex max-w-132 grow flex-col">
        <h2 className="text-xs font-bold text-gray-100 uppercase">{t('subtitleWhy')}</h2>
        <p className="mt-3 text-xs text-gray-100">{t('descriptionWhy')}</p>

        <h2 className="mt-8 text-xs font-bold text-gray-100 uppercase">{t('subtitleHow')}</h2>

        <NeonMigrateSteps className="mt-5" />
      </div>

      <div className="flex gap-2">
        <Button
          label={t('importButtonLabel')}
          variant="outlined"
          wide
          flat
          onClick={modalNavigateWrapper('neon-migrate-step-2')}
        />
        <Button
          label={t('startProcessButtonLabel')}
          rightIcon={<TbExternalLink />}
          onClick={openNeon2Click}
          iconsOnEdge={false}
          wide
          flat
        />
      </div>
    </SettingsLayout>
  )
}

export default SettingsNeonMigratePage
