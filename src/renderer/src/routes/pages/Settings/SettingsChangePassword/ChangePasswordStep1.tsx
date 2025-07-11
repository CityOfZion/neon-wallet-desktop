import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import TbReload from '@renderer/assets/images/tb-reload.svg?react'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { PasswordStrength } from '@renderer/components/PasswordStrength'
import { Separator } from '@renderer/components/Separator'
import { PasswordHelper } from '@renderer/helpers/PasswordHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

type TFormData = {
  newPassword: string
  currentPassword: string
}

export const ChangePasswordStep1 = (): JSX.Element => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step1' })
  const navigate = useNavigate()
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const { handleAct, setError, actionState, actionData, reset, setData, setDataFromEventWrapper } =
    useActions<TFormData>({
      newPassword: '',
      currentPassword: '',
    })

  const handleSubmit = async (data: TFormData) => {
    if (!currentLoginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    const decryptedPassword = await window.api.sendAsync(
      'decryptBasedOS',
      currentLoginSessionRef.current.encryptedPassword
    )
    const encryptedNewPassword = await window.api.sendAsync('encryptBasedOS', data.newPassword)
    if (data.currentPassword.length === 0 || data.currentPassword !== decryptedPassword) {
      setError('currentPassword', t('error'))
      return
    }

    navigate('/app/settings/security/change-password/step-2', { state: { encryptedNewPassword } })

    reset()
  }

  const handlePassword = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setData({ newPassword: value })

    setIsPasswordValid(PasswordHelper.isWeakPassword(value))
  }

  const handleGeneratePassword = () => {
    setData({ newPassword: UtilsHelper.generateStrongPassword() })

    setIsPasswordValid(true)
  }

  return (
    <div className="flex h-full w-full flex-col items-center px-5">
      <form className="flex flex-grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <div className="mb-6 text-center">
          <span className="text-xs">{t('subtitle')}</span>
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="w-[27rem]">
            <div className="mb-2 flex w-full items-center justify-between">
              <span className="text-xs font-bold uppercase text-gray-100">{t('titleInput1')}</span>
              <Button
                variant="text"
                flat
                type="button"
                leftIcon={<TbReload aria-hidden={true} />}
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
            <div className="mb-2 mt-5 flex w-full">
              <span className="text-xs font-bold uppercase text-gray-100">{t('titleInput2')}</span>
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
              rightIcon={<TbArrowRight />}
              iconsOnEdge={false}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
