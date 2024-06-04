import { useTranslation } from 'react-i18next'
import { TbReload } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { TUseBackupOrMigrateActionsData, useBackupOrMigrate } from '@renderer/hooks/useBackupOrMigrate'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsRecoverWallet = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsRecoverWallet' })
  const { actionData, handleBrowse, actionState, handleAct } = useBackupOrMigrate()
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleSubmit = async (data: TUseBackupOrMigrateActionsData) => {
    if (!data.content || !data.path || !data.type) return

    if (data.type === 'migrate') {
      navigate('/app/settings/security/migrate-accounts')
      modalNavigate('migrate-accounts-step-3', { state: { content: data.content } })
      return
    }

    modalNavigate('confirm-password-recover', { state: { content: data.content }, replace: true })
  }

  return (
    <SettingsLayout title={t('title')}>
      <form className="w-full h-full flex flex-col" onSubmit={handleAct(handleSubmit)}>
        <div className="h-full">
          <p className="mb-7 text-xs">{t('description')}</p>

          <p className="uppercase text-gray-100 font-bold text-xs mb-3.5">{t('saveBackupLabel')}</p>

          <div className="w-fit">
            <div className="flex gap-2.5">
              <Input value={actionData?.path ?? ''} compacted readOnly containerClassName="w-[17rem]" />

              <Button flat label={t('browse')} type="button" onClick={handleBrowse} className="w-36 h-fit" />
            </div>

            {actionState.errors.path && <AlertErrorBanner message={actionState.errors.path} className="mt-4" />}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            label={t('backup')}
            leftIcon={<TbReload />}
            iconsOnEdge={false}
            className="w-52"
            disabled={!actionData.path}
          />
        </div>
      </form>
    </SettingsLayout>
  )
}
