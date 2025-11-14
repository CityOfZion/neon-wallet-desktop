import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdCheckCircleOutline from '@renderer/assets/images/md-check-circle-outline.svg?react'
import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'

import { TModalState } from '@shared/types/modal'

type TActionData = {
  password: string
}

const ConfirmActionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmAction' })
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const { onSuccess, onCancel } = useModalState<TModalState<'confirm-action'>>()
  const { modalErase } = useModalNavigate()

  const { actionData, actionState, handleAct, setError, setDataFromEventWrapper } = useActions<TActionData>({
    password: '',
  })

  const shouldPromptPassword = currentLoginSession?.type === 'password'

  const handleSubmit = async () => {
    if (!currentLoginSession) {
      throw new Error('Login session not defined')
    }

    if (shouldPromptPassword) {
      const encryptedPassword = currentLoginSession.encryptedPassword
      const decryptedPassword = await window.api.sendAsync('decryptBasedOS', encryptedPassword)

      if (actionData.password.length === 0 || actionData.password !== decryptedPassword) {
        setError('password', t('passwordError'))
        return
      }
    }

    onSuccess()
    modalErase()
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbAlertTriangle aria-hidden className="text-neon" />}
      contentClassName="flex flex-col"
      onErase={onCancel}
      onBack={onCancel}
    >
      <p className="mb-5 text-xs">{t('description')}</p>

      <form className="flex grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
        {shouldPromptPassword && (
          <Fragment>
            <Input
              placeholder={t('inputPlaceholder')}
              error={!!actionState.errors.password}
              value={actionData.password}
              onChange={setDataFromEventWrapper('password')}
              compacted
              type="password"
            />

            {actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} className="mt-5" />}
          </Fragment>
        )}

        <div className="mt-auto flex w-full flex-col items-center">
          <Separator className="my-7" />

          <Button
            className="w-60"
            leftIcon={<MdCheckCircleOutline aria-hidden />}
            iconsOnEdge={false}
            type="submit"
            label={t('confirmButtonLabel')}
            disabled={shouldPromptPassword ? !actionState.isValid : false}
          />
        </div>
      </form>
    </SideModalLayout>
  )
}

export default ConfirmActionModal
