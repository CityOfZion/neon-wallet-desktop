import { useTranslation } from 'react-i18next'
import { MdLooksTwo } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { TUseBackupOrMigrateActionsData, useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

export const MigrateAccountsStep2Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step2' })
  const { actionData, actionState, handleAct, handleBrowse } = useBackupOrMigrate()
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()

  const handleSubmit = async (data: TUseBackupOrMigrateActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'backup') {
      navigate('/app/settings/security/recover-wallet')
      modalNavigate('confirm-password-recover', { state: { content: data.content as string }, replace: true })
      return
    }

    modalNavigate('migrate-accounts-step-3', { state: { content: data.content } })
  }

  return (
    <MigrateAccountsModalLayout currentStep={2} stepIcon={<MdLooksTwo />} stepTitle={t('title')}>
      <form className="flex flex-col w-full h-full" onSubmit={handleAct(handleSubmit)}>
        <div className="flex flex-col items-center flex-grow">
          <p>{t('description')}</p>

          <Input compacted label={t('inputLabel')} value={actionData.path ?? ''} readOnly containerClassName="mt-5" />

          {actionState.errors.path && <AlertErrorBanner message={actionState.errors.path} className="w-full mt-3" />}

          <Button type="button" label={t('buttonBrowseLabel')} className="mt-5" wide flat onClick={handleBrowse} />
        </div>

        <Button label={t('buttonImportLabel')} flat className="px-16" disabled={!actionData.path} />
      </form>
    </MigrateAccountsModalLayout>
  )
}
