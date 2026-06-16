import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import TbReload from '@renderer/assets/images/tb-reload.svg?react'

const SettingsRecoverWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsRecoverWallet' })
  const { actionData, handleBrowse, actionState, handleAct } = useImportFromFile()
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleSubmit = async (data: TUseImportFromFileActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      navigate('/settings/security/migrate-accounts')
      modalNavigate('neon-migrate-step-3', { state: { content: data.content } })
      return
    }

    if (data.type === 'nep6') {
      modalNavigate('nep6-backup-import-step-3', { state: { content: data.content } })
      return
    }

    modalNavigate('confirm-password-recover', { state: { data } })
  }

  return (
    <SettingsLayout title={t('title')}>
      <form className="flex h-full w-full flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="h-full">
          <p className="mb-7 text-xs">{t('description')}</p>

          <p className="mb-3.5 text-xs font-bold text-gray-100 uppercase">{t('saveBackupLabel')}</p>

          <div className="w-fit">
            <div className="flex gap-2.5">
              <Input value={actionData?.path || ''} compacted readOnly containerClassName="w-68" />

              <Button flat label={t('browse')} type="button" onClick={handleBrowse} className="h-fit w-36" />
            </div>

            {actionState.errors.path && <AlertErrorBanner message={actionState.errors.path} className="mt-4" />}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            label={t('backup')}
            leftIcon={<TbReload aria-hidden />}
            iconsOnEdge={false}
            className="w-52"
            disabled={!actionData.path}
          />
        </div>
      </form>
    </SettingsLayout>
  )
}

export default SettingsRecoverWallet
