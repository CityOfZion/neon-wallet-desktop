import { ChangeEvent, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { PasswordStrength } from '@renderer/components/PasswordStrength'
import { Separator } from '@renderer/components/Separator'

import { PasswordHelper } from '@renderer/helpers/PasswordHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import TbReload from '@renderer/assets/images/tb-reload.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'

type TFormData = {
  newPassword: string
  currentPassword: string
}

const ChangePasswordStep1 = () => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step1' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const { handleAct, setError, actionState, actionData, reset, setData, setDataFromEventWrapper } =
    useActions<TFormData>({
      newPassword: '',
      currentPassword: '',
    })

  const handleSubmit = async (data: TFormData) => {
    if (!loginSessionRef.current) {
      throw new AppError(commonT('errors.loginSessionIsNotDefined'))
    }

    const decryptedPassword = await window.api.sendAsync(
      'encryption:decryptBasedOS',
      loginSessionRef.current.encryptedPassword
    )
    const encryptedNewPassword = await window.api.sendAsync('encryption:encryptBasedOS', data.newPassword)
    if (data.currentPassword.length === 0 || data.currentPassword !== decryptedPassword) {
      setError('currentPassword', t('error'))
      return
    }

    navigate('/settings/security/change-password/2', { state: { encryptedNewPassword } })

    reset()
  }

  const handlePassword = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setData({ newPassword: value })

    setIsPasswordValid(PasswordHelper.isWeakPassword(value))
  }

  const handleGeneratePassword = () => {
    setData({ newPassword: PasswordHelper.generateStrongPassword() })

    setIsPasswordValid(true)
  }

  return (
    <div className="flex h-full w-full flex-col items-center px-5">
      <form className="flex grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <div className="mb-6 text-center">
          <span className="text-xs">{t('subtitle')}</span>
        </div>
        <div className="flex grow flex-col justify-between">
          <div className="w-108">
            <div className="mb-2 flex w-full items-center justify-between">
              <span className="text-xs font-bold text-gray-100 uppercase">{t('titleInput1')}</span>
              <Button
                variant="text"
                flat
                type="button"
                leftIcon={<TbReload aria-hidden />}
                label={t('generatePassword')}
                onClick={handleGeneratePassword}
              />
            </div>
            <div className="mb-5 flex flex-col items-center">
              <Input
                type="password"
                placeholder={t('inputNewPasswordPlaceholder')}
                onChange={handlePassword}
                value={actionData.newPassword}
                compacted
              />
              <PasswordStrength password={actionData.newPassword} />
            </div>
            <Separator />
            <div className="mt-5 mb-2 flex w-full">
              <span className="text-xs font-bold text-gray-100 uppercase">{t('titleInput2')}</span>
            </div>
            <div className="mb-5 flex flex-col items-center">
              <Input
                type="password"
                placeholder={t('inputCurrentPasswordPlaceholder')}
                onChange={setDataFromEventWrapper('currentPassword')}
                value={actionData.currentPassword}
                compacted
              />
              <div className="mt-3 w-full">
                {actionState.errors.currentPassword && (
                  <AlertErrorBanner message={actionState.errors.currentPassword} />
                )}
              </div>
            </div>
          </div>
          <div className="mb-8 flex w-full justify-center">
            <Button
              clickableProps={{ className: 'w-52 h-12' }}
              type="submit"
              label={t('buttonContinue')}
              loading={actionState.isActing}
              disabled={!isPasswordValid || !actionData.currentPassword}
              rightIcon={<TbArrowRight aria-hidden />}
              iconsOnEdge={false}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordStep1
