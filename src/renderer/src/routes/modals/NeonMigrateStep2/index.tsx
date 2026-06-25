import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { ImportModalLayout } from '@renderer/layouts/ImportModalLayout'

import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'

const NeonMigrateStep2Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'neonMigrate' })
  const { actionData, actionState, handleAct, handleBrowse } = useImportFromFile()
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()

  const handleSubmit = async (data: TUseImportFromFileActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      modalNavigate('neon-migrate-step-3', { state: { content: data.content } })
      return
    }

    if (data.type === 'nep6') {
      navigate('/settings/security/recover-wallet')
      modalNavigate('nep6-backup-import-step-3', { state: { content: data.content }, replace: true })

      return
    }

    navigate('/settings/security/recover-wallet')
    modalNavigate('confirm-password-recover', { state: { data }, replace: true })
  }

  return (
    <ImportModalLayout
      heading={t('title')}
      size="xl"
      step={2}
      stepIcon={<MdLooksTwo aria-hidden />}
      stepTitle={t('step2.title')}
    >
      <form className="flex size-full flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="flex grow flex-col items-center">
          <p>{t('step2.description')}</p>

          <Input
            compacted
            label={t('step2.inputLabel')}
            value={actionData.path || ''}
            readOnly
            containerClassName="mt-5"
          />

          {actionState.errors.path && <AlertErrorBanner message={actionState.errors.path} className="mt-3 w-full" />}

          <Button
            type="button"
            label={t('step2.browseButtonLabel')}
            className="mt-5"
            wide
            flat
            onClick={handleBrowse}
          />
        </div>

        <Button label={t('step2.importButtonLabel')} flat className="px-16" disabled={!actionData.path} />
      </form>
    </ImportModalLayout>
  )
}

export default NeonMigrateStep2Modal
