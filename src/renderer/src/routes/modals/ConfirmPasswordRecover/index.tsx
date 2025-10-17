import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  TUseNeonBackupData,
  TUseNeonBackupDeprecatedData,
  TUseNeonBackupGeneratedData,
  useNeonImportBackup,
} from '@renderer/hooks/useNeonBackup'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbReload from '@renderer/assets/images/tb-reload.svg?react'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

type TFormData = {
  password: string
}

type TLocationState = {
  data: TUseNeonBackupData | TUseNeonBackupDeprecatedData
  onDecrypt: (data: TUseNeonBackupGeneratedData) => void
}

const SuccessFooter = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex w-full grow flex-col items-center justify-end gap-7">
      <Separator />
      <Button label={t('returnSettings')} onClick={modalNavigateWrapper(-1)} className="w-full px-9" />
    </div>
  )
}

const ConfirmPasswordRecoverModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { data, onDecrypt } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const { handleImportBackupData, handleTryDecryptData, handleGenerateData } = useNeonImportBackup()

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError, reset } = useActions<TFormData>({
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

      await SharedUtilsHelper.sleep(2000)

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbReload className="text-neon" />,
          subtitle: t('modalDescription'),
          footer: <SuccessFooter />,
        },
        replace: true,
      })
    } catch {
      reset()
      setError('password', t('error'))
    }
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbReload className="text-neon" />}
      contentClassName="flex flex-col"
    >
      <p className="mb-5 text-xs">{t('description')}</p>
      <p className="mb-3.5 font-bold text-gray-300 uppercase">{t('subtitle')}</p>

      <form className="flex grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
        <div>
          <Input
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.password}
            value={actionData.password}
            onChange={setDataFromEventWrapper('password')}
            compacted
            type="password"
          />

          <div className="mt-5">
            {actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} />}
          </div>
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
