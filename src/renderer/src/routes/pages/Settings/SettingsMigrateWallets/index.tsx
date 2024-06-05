import { useTranslation } from 'react-i18next'
import { MdLaunch } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { MigrateSteps } from '@renderer/components/MigrateSteps'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsMigrateWalletsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsMigrateWallets' })
  const { modalNavigateWrapper } = useModalNavigate()

  const openNeon2Click = () => {
    window.open('neon://open')
  }
  return (
    <SettingsLayout title={t('title')} contentClassName="items-center">
      <div className="max-w-[33rem] flex flex-col flex-grow">
        <h2 className="text-xs text-gray-100 uppercase font-bold">{t('subtitleWhy')}</h2>
        <p className="text-xs text-gray-100 mt-3">{t('descriptionWhy')}</p>

        <h2 className="text-xs text-gray-100 uppercase font-bold mt-8">{t('subtitleHow')}</h2>

        <MigrateSteps className="mt-5" />
      </div>

      <div className="flex gap-2">
        <Button
          label={t('importButtonLabel')}
          variant="outlined"
          wide
          flat
          onClick={modalNavigateWrapper('migrate-accounts-step-2')}
        />
        <Button
          label={t('startProcessButtonLabel')}
          rightIcon={<MdLaunch />}
          onClick={openNeon2Click}
          iconsOnEdge={false}
          wide
          flat
        />
      </div>
    </SettingsLayout>
  )
}
