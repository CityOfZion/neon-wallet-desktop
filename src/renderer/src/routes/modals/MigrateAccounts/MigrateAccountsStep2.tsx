import { useTranslation } from 'react-i18next'
import { MdLooksTwo } from 'react-icons/md'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

export const MigrateAccountsStep2Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step2' })
  const { file, handleBrowse, handleImport, hasError } = useBackupOrMigrate()

  return (
    <MigrateAccountsModalLayout currentStep={2} stepIcon={<MdLooksTwo />} stepTitle={t('title')}>
      <div className="flex flex-col items-center flex-grow">
        <p>{t('description')}</p>

        <Input compacted label={t('inputLabel')} value={file?.path ?? ''} readOnly containerClassName="mt-5" />

        {hasError && <AlertErrorBanner message={t('error')} className="w-full mt-3" />}

        <Button label={t('buttonBrowseLabel')} className="mt-5" wide flat onClick={handleBrowse} />
      </div>

      <Button label={t('buttonImportLabel')} flat className="px-16" disabled={!file} onClick={handleImport} />
    </MigrateAccountsModalLayout>
  )
}
