import React from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Link } from '@renderer/components/Link'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useLogin } from '@renderer/hooks/useLogin'
import { useNavigateReset } from '@renderer/hooks/useNavigateReset'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

type TFormData = {
  password: string
}

export const LoginPasswordFormContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginPassword.formContent' })
  const navigateReset = useNavigateReset()
  const { loginWithPassword } = useLogin()

  const { actionData, actionState, setData, setError, handleAct } = useActions<TFormData>({
    password: '',
  })

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value
    setData({ password })

    if (!password.length) {
      setError('password', t('invalidPassword'))
      return
    }
  }

  const handleSubmit = async (data: TFormData) => {
    try {
      await loginWithPassword(data.password)
      navigateReset('/wallets/overview')

      // Improve UX
      await SharedUtilsHelper.sleep(2000)
    } catch (error) {
      setError('password', AppError.wrap(error, t('invalidPassword')).displayMessage)
    }
  }

  return (
    <form
      className="flex w-full grow flex-col items-center justify-between"
      onSubmit={handleAct(handleSubmit)}
      {...TestHelper.buildTestObject('login-container')}
    >
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-y-6">
          <p className="text-center text-sm text-white">{t('text')}</p>

          <Input
            testId="login-password-input"
            type="password"
            value={actionData.password}
            onChange={handleChangePassword}
            placeholder={t('passwordPlaceholder')}
            errorMessage={actionState.errors.password}
            autoFocus
            className="placeholder:text-white"
          />
        </div>

        <Link
          to="/forgotten-password/form"
          label={t('forgotPassword')}
          colorSchema="neon"
          variant="text-slim"
          className="mx-auto mt-2 w-fit p-4"
          {...TestHelper.buildTestObject('login-forgot-password')}
        />
      </div>

      <Button
        label={t('buttonLoginLabel')}
        className="mt-auto w-[250px]"
        variant="contained"
        type="submit"
        disabled={!actionState.isValid || actionState.isActing}
        loading={actionState.isActing}
        {...TestHelper.buildTestObject('login-submit')}
      />
    </form>
  )
}
