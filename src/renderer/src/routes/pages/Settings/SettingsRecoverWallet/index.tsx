import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import TbReload from '@renderer/assets/images/tb-reload.svg?react'

const SettingsRecoverWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsRecoverWallet' })
  const { actionData, handleBrowse, handleAct } = useImportFromFile()
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
      <form className="flex size-full flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="h-full">
          <p className="mb-7 text-xs">{t('description')}</p>

          <label htmlFor="save-backup-input" className="mb-3.5 block text-xs font-bold text-gray-100 uppercase">
            {t('saveBackupLabel')}
          </label>

          <div className="flex w-fit gap-2">
            <Input id="save-backup-input" value={actionData?.path || ''} compacted readOnly containerClassName="w-76" />

            <Button flat label={t('browse')} type="button" onClick={handleBrowse} className="h-fit w-32" />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            label={t('backup')}
            className="w-52"
            iconsOnEdge={false}
            disabled={!actionData.path}
            leftIcon={<TbReload aria-hidden />}
          />
        </div>
      </form>
    </SettingsLayout>
  )
}

export default SettingsRecoverWallet
