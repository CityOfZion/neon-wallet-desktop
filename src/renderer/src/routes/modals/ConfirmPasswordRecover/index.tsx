import { useTranslation } from 'react-i18next'
import { TbReload } from 'react-icons/tb'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  TUseNeonBackupData,
  TUseNeonBackupDataSchema,
  TUseNeonBackupDeprecatedData,
  useNeonImportBackup,
} from '@renderer/hooks/useNeonBackup'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TFormData = {
  password: string
}

type TLocationState = {
  data: TUseNeonBackupData | TUseNeonBackupDeprecatedData
  onDecrypt: (data: TUseNeonBackupDataSchema) => void
}

const SuccessFooter = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex flex-col items-center flex-grow w-full justify-end gap-7">
      <Separator />
      <Button label={t('returnSettings')} onClick={modalNavigateWrapper(-1)} className="w-full px-9" />
    </div>
  )
}

export const ConfirmPasswordRecoverModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordRecover' })
  const { data, onDecrypt } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const { handleImportBackupData, handleTryDecryptData } = useNeonImportBackup()

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

      if (onDecrypt) {
        onDecrypt(decryptedData)
        return
      }

      await handleImportBackupData(decryptedData)

      await UtilsHelper.sleep(2000)

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
      <p className="text-xs mb-5">{t('description')}</p>
      <p className="text-gray-300 uppercase font-bold mb-3.5">{t('subtitle')}</p>

      <form className="flex flex-col justify-between flex-grow" onSubmit={handleAct(handleSubmit)}>
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

        <div className="flex flex-col w-full items-center">
          <Separator className="my-7" />
          <Button className="w-60" type="submit" label={t('buttonContinueLabel')} loading={actionState.isActing} flat />
        </div>
      </form>
    </SideModalLayout>
  )
}
