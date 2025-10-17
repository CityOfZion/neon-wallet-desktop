import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNeonCreateBackup } from '@renderer/hooks/useNeonBackup'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdOutlineSave from '@renderer/assets/images/md-outline-save.svg?react'

type TFormData = {
  password: string
}

type TLocationState = {
  selectedFilePath: string
}

const SuccessFooter = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordBackup' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex w-full grow flex-col items-center justify-end gap-7">
      <ButtonDownloadPasswordQRCode />
      <Separator />
      <Button label={t('returnSettings')} onClick={modalNavigateWrapper(-1)} className="w-full px-9" />
    </div>
  )
}

const ConfirmPasswordBackupModal = () => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordBackup' })
  const { selectedFilePath } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const { handleCreateBackup } = useNeonCreateBackup()

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    if (!currentLoginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    const encryptedPassword = currentLoginSessionRef.current.encryptedPassword

    const decryptedPassword = await window.api.sendAsync('decryptBasedOS', encryptedPassword)

    if (password.length === 0 || password !== decryptedPassword) {
      setError('password', t('error'))
      return
    }

    try {
      await handleCreateBackup(password, selectedFilePath)

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <MdOutlineSave aria-hidden className="text-neon" />,
          subtitle: t('modalDescription'),
          footer: <SuccessFooter />,
        },
        replace: true,
      })
    } catch {
      ToastHelper.error({ message: t('errorBackup') })
    }
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdOutlineSave aria-hidden className="text-neon" />}
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
          <Banner
            type="warningOrange"
            message={
              <span>
                {t('warning')}
                <span className="text-orange pl-0.75">{t('warningHighlighted')}</span>
              </span>
            }
          />
          <Separator className="my-7" />
          <Button
            className="w-full px-9"
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

export default ConfirmPasswordBackupModal
