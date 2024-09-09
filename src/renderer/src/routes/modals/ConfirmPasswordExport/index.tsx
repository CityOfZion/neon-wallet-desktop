import { useTranslation } from 'react-i18next'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
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
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordExport' })

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    const decryptedPassword = await window.api.sendAsync('decryptBasedOS', encryptedPassword ?? '')
    if (password.length === 0 || password !== decryptedPassword) {
      setError('password', t('error'))
      return
    }

    onSubmitPassword()
  }

  return (
    <SideModalLayout heading={title} headingIcon={icon} contentClassName="flex flex-col">
      <p className="text-xs mb-5">{t('description')}</p>

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

        <div className="flex flex-col w-full items-center px-5">
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
