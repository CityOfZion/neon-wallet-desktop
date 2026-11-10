import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Tooltip } from '@renderer/components/Tooltip'

import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { ImportModalLayout } from '@renderer/layouts/ImportModalLayout'

import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'

const NeonMigrateStep2Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'neonMigrate.step2' })
  const { t: tParent } = useTranslation('modals', { keyPrefix: 'neonMigrate' })
  const { actionData, handleAct, handleBrowse } = useImportFromFile()
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()

  const path = actionData.path || ''

  const handleSubmit = async (data: TUseImportFromFileActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      modalNavigate('neon-migrate-step-3', { state: { content: data.content } })
      return
    }

    const onSuccess = () => {
      navigate('/settings/security/recover-wallet', { state: { data: undefined }, replace: true })
    }

    if (data.type === 'nep6') {
      navigate('/settings/security/recover-wallet', { state: { data } })
      modalNavigate('nep6-backup-import-step-3', { state: { content: data.content, onSuccess }, replace: true })

      return
    }

    navigate('/settings/security/recover-wallet', { state: { data } })
    modalNavigate('confirm-password-recover', { state: { data, onSuccess }, replace: true })
  }

  return (
    <ImportModalLayout
      heading={tParent('title')}
      size="xl"
      step={2}
      stepTitle={t('title')}
      stepIcon={<MdLooksTwo aria-hidden />}
    >
      <form className="flex size-full flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="flex grow flex-col items-center">
          <p>{t('description')}</p>

          <div className="mt-5 flex w-full items-end gap-x-2">
            <Tooltip title={path} contentProps={{ className: 'mx-2' }}>
              <Input label={t('inputLabel')} placeholder={t('inputPlaceholder')} value={path} compacted readOnly />
            </Tooltip>

            <Button
              label={t('browseButtonLabel')}
              type="button"
              wide
              flat
              clickableProps={{ className: 'px-4' }}
              onClick={handleBrowse}
            />
          </div>
        </div>

        <Button label={t('importButtonLabel')} className="mx-auto w-56" flat disabled={!path} />
      </form>
    </ImportModalLayout>
  )
}

export default NeonMigrateStep2Modal
