import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Tooltip } from '@renderer/components/Tooltip'

import { TUseImportFromFileActionsData, useImportFromFile } from '@renderer/hooks/useImportFromFile'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import TbReload from '@renderer/assets/images/tb-reload.svg?react'

type TLocationState = {
  data?: TUseImportFromFileActionsData
}

const SettingsRecoverWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsRecoverWallet' })
  const { state, key } = useLocation() as Location<TLocationState>
  const { actionData, reset, handleBrowse, handleAct } = useImportFromFile(state?.data)
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const path = actionData?.path || ''

  const handleSubmit = async (data: TUseImportFromFileActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      navigate('/settings/security/migrate-accounts')
      modalNavigate('neon-migrate-step-3', { state: { content: data.content } })
      return
    }

    if (data.type === 'nep6') {
      modalNavigate('nep6-backup-import-step-3', { state: { content: data.content, onSuccess: reset } })
      return
    }

    modalNavigate('confirm-password-recover', { state: { data, onSuccess: reset } })
  }

  useEffect(() => {
    if (!state?.data) reset()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <SettingsLayout title={t('title')}>
      <form className="flex size-full flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="h-full">
          <p className="mb-7 text-xs">{t('description')}</p>

          <div className="flex w-fit items-end gap-2">
            <Tooltip title={path}>
              <Input
                label={t('locateBackupLabel')}
                placeholder={t('locateBackupPlaceholder')}
                value={path}
                compacted
                readOnly
                containerClassName="w-76"
              />
            </Tooltip>

            <Button flat label={t('browse')} type="button" onClick={handleBrowse} className="w-32" />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            label={t('backup')}
            className="w-52"
            iconsOnEdge={false}
            disabled={!path}
            leftIcon={<TbReload aria-hidden />}
          />
        </div>
      </form>
    </SettingsLayout>
  )
}

export default SettingsRecoverWallet
