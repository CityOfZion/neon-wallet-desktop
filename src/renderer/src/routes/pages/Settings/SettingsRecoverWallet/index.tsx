import { useTranslation } from 'react-i18next'
import { TbReload } from 'react-icons/tb'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsRecoverWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsRecoverWallet' })
  const { file, handleBrowse, handleImport, hasError } = useBackupOrMigrate()

  return (
    <SettingsLayout title={t('title')}>
      <div className="h-full">
        <p className="mb-7 text-xs">{t('description')}</p>

        <p className="uppercase text-gray-100 font-bold text-xs mb-3.5">{t('saveBackupLabel')}</p>

        <div className="w-fit">
          <div className="flex gap-2.5">
            <Input value={file?.path ?? ''} compacted readOnly containerClassName="w-[17rem]" />

            <Button flat label={t('browse')} onClick={handleBrowse} className="w-36 h-fit" />
          </div>

          {hasError && <AlertErrorBanner message={t('fileError')} className="mt-4" />}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          label={t('backup')}
          leftIcon={<TbReload />}
          iconsOnEdge={false}
          onClick={handleImport}
          className="w-52"
        />
      </div>
    </SettingsLayout>
  )
}
