import { BSUtilsHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNeonBackupFile } from '@renderer/hooks/useNeonBackupFile'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbReload from '@renderer/assets/images/tb-reload.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TModalState } from '@shared/types/modal'

type TFormData = {
  password: string
}

const SuccessFooter = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex w-full grow flex-col items-center justify-end gap-7">
      <Separator />
      <Button label={t('returnSettings')} className="w-56" onClick={modalNavigateWrapper(-1)} />
    </div>
  )
}

const ConfirmPasswordRecoverModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { data, onDecrypt, onSuccess } = useModalState<TModalState<'confirm-password-recover'>>()
  const { modalNavigate } = useModalNavigate()
  const { handleImportBackupData, handleTryDecryptData, handleGenerateData } = useNeonBackupFile()

  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    if (password.length === 0) {
      setError('password', t('error'))
      return
    }

    try {
      const decryptedData = await handleTryDecryptData(data, password)
      const generatedData = handleGenerateData(decryptedData)

      if (onDecrypt) {
        onDecrypt(generatedData)
        return
      }

      await handleImportBackupData(generatedData)

      await BSUtilsHelper.wait(2000)

      onSuccess?.()
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbReload aria-hidden className="text-neon" />,
          subtitle: t('modalDescription'),
          footer: <SuccessFooter />,
        },
        replace: true,
      })
    } catch (error) {
      setError('password', AppError.wrap(error, t('error')).displayMessage)
    }
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReload className="text-neon" />}
      contentClassName="flex flex-col"
    >
      <p className="mb-5 text-xs">{t('description')}</p>

      <form className="flex grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
        <div className="flex flex-col gap-y-3">
          <Input
            label={t('inputLabel')}
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.password}
            value={actionData.password}
            onChange={setDataFromEventWrapper('password')}
            compacted
            type="password"
          />

          {actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} />}
        </div>

        <div className="flex w-full flex-col items-center">
          <Separator className="my-7" />
          <Button className="w-60" type="submit" label={t('buttonContinueLabel')} loading={actionState.isActing} flat />
        </div>
      </form>
    </SideModalLayout>
  )
}

export default ConfirmPasswordRecoverModal
