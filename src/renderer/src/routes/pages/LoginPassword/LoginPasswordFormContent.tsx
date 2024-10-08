import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Link } from '@renderer/components/Link'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useLogin } from '@renderer/hooks/useLogin'

type TFormData = {
  password: string
}

export const LoginPasswordFormContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginPassword.formContent' })
  const navigate = useNavigate()
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
      navigate('/app/portfolio/overview')
    } catch (error: any) {
      setError('password', t('invalidPassword'))
    }
  }

  return (
    <form
      className="w-full flex-grow flex flex-col justify-between items-center"
      onSubmit={handleAct(handleSubmit)}
      {...TestHelper.buildTestObject('login-container')}
    >
      <div className="flex flex-col w-full">
        <div className="flex flex-col w-full gap-y-6">
          <p className="text-white text-sm text-center">{t('text')}</p>

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
          to="/forgotten-password"
          label={t('forgotPassword')}
          colorSchema="neon"
          variant="text-slim"
          className="mt-2 w-fit mx-auto p-4"
          {...TestHelper.buildTestObject('login-forgot-password')}
        />
      </div>

      <Button
        label={t('buttonLoginLabel')}
        className="w-[250px]"
        variant="contained"
        type="submit"
        disabled={!actionState.isValid || actionState.isActing}
        loading={actionState.isActing}
        {...TestHelper.buildTestObject('login-submit')}
      />
    </form>
  )
}
