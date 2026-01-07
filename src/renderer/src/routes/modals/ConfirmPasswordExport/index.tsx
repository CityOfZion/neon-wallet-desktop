import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TModalState } from '@shared/types/modal'

type TFormData = {
  password: string
}

const ConfirmPasswordExportModal = () => {
  const { onSubmitPassword, title, icon } = useModalState<TModalState<'confirm-password-export'>>()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordExport' })
  const { t: tCommon } = useTranslation('common')

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    if (!currentLoginSessionRef.current) {
      throw new AppError(tCommon('errors.loginSessionIsNotDefined'))
    }

    const decryptedPassword = await window.api.sendAsync(
      'encryption:decryptBasedOS',
      currentLoginSessionRef.current?.encryptedPassword
    )

    if (password.length === 0 || password !== decryptedPassword) {
      setError('password', t('error'))
      return
    }

    onSubmitPassword()
  }

  return (
    <SideModalLayout heading={title} headingIcon={icon} contentClassName="flex flex-col">
      <p className="mb-5 text-xs">{t('description')}</p>

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

        <div className="flex w-full flex-col items-center px-5">
          <Button
            className="w-full"
            type="submit"
            label={t('buttonContinueLabel')}
            loading={actionState.isActing}
            flat
          />
        </div>
      </form>
    </SideModalLayout>
  )
}

export default ConfirmPasswordExportModal
