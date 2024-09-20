import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowRight, TbReload } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { PasswordStrenght } from '@renderer/components/PasswordStrenght'
import { Separator } from '@renderer/components/Separator'
import { regexGood, regexStrong } from '@renderer/constants/password'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useLoginSessionSelector } from '@renderer/hooks/useSettingsSelector'

type TFormData = {
  newPassword: string
  currentPassword: string
}

export const ChangePasswordStep1 = (): JSX.Element => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step1' })
  const navigate = useNavigate()

  const [passwordStrenghtValid, setPasswordStrenghtValid] = useState<boolean>(false)

  const { handleAct, setError, actionState, actionData, reset, setData, setDataFromEventWrapper } =
    useActions<TFormData>({
      newPassword: '',
      currentPassword: '',
    })

  const handleSubmit = async (data: TFormData) => {
    if (!loginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    const decryptedPassword = await window.api.sendAsync('decryptBasedOS', loginSessionRef.current.encryptedPassword)
    const encryptedNewPassword = await window.api.sendAsync('encryptBasedOS', data.newPassword)
    if (data.currentPassword.length === 0 || data.currentPassword !== decryptedPassword) {
      setError('currentPassword', t('error'))
      return
    }

    navigate('/app/settings/security/change-password/step-2', { state: { encryptedNewPassword } })

    reset()
  }

  const handlePasswordStrenght = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({ newPassword: value })

    if (value.length <= 4) {
      setPasswordStrenghtValid(false)
      return
    }

    if (regexStrong.test(value)) {
      setPasswordStrenghtValid(true)
    }

    if (regexGood.test(value)) {
      setPasswordStrenghtValid(true)
      return
    }

    setPasswordStrenghtValid(false)
    return
  }

  const handleGeneratePassword = () => {
    setData({ newPassword: UtilsHelper.generateStrongPassword() })
    setPasswordStrenghtValid(true)
  }

  return (
    <div className="w-full px-5 flex flex-col h-full items-center">
      <form className="flex flex-col justify-between items-center flex-grow" onSubmit={handleAct(handleSubmit)}>
        <div className="mb-6 text-center">
          <span className="text-xs">{t('subtitle')}</span>
        </div>
        <div className="flex flex-col justify-between flex-grow">
          <div className="w-[27rem]">
            <div className="w-full flex mb-2 justify-between items-center">
              <span className="text-gray-100 uppercase text-xs font-bold">{t('titleInput1')}</span>
              <Button
                variant="text"
                flat
                type="button"
                leftIcon={<TbReload />}
                label={t('generatePassword')}
                onClick={handleGeneratePassword}
              />
            </div>
            <div className="flex flex-col items-center mb-5">
              <Input
                type="password"
                placeholder={t('inputNewPasswordPlaceholder')}
                onChange={handlePasswordStrenght}
                value={actionData.newPassword}
                compacted
              />
              <PasswordStrenght password={actionData.newPassword} />
            </div>
            <Separator />
            <div className="w-full flex mt-5 mb-2">
              <span className="text-gray-100 uppercase text-xs font-bold">{t('titleInput2')}</span>
            </div>
            <div className="flex flex-col items-center mb-5">
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
          <div className="flex justify-center w-full mb-8">
            <Button
              clickableProps={{ className: 'w-52 h-12' }}
              type="submit"
              label={t('buttonContinue')}
              loading={actionState.isActing}
              disabled={!passwordStrenghtValid || !actionData.currentPassword}
              rightIcon={<TbArrowRight />}
              iconsOnEdge={false}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
