import { useTranslation } from 'react-i18next'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TFormData = {
  password: string
}

type TLocationState = {
  title: string
  icon: JSX.Element
  onSubmitPassword: () => void
}

export const ConfirmPasswordExportModal = () => {
  const { onSubmitPassword, title, icon } = useModalState<TLocationState>()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordExport' })

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    if (!currentLoginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    const decryptedPassword = await window.api.sendAsync(
      'decryptBasedOS',
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

      <form className="flex flex-grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
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
