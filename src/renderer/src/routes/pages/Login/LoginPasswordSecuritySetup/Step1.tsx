import { ChangeEvent, Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { PasswordHelper } from '@renderer/helpers/PasswordHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useActions } from '@renderer/hooks/useActions'

type TFormData = {
  password: string
}

type TProps = {
  onSubmit?: (password: string) => void
}

const LoginPasswordSecuritySetupStep1Page = ({ onSubmit }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.step1' })
  const { t: commonT } = useTranslation('common')
  const navigate = useNavigate()

  const { actionData, actionState, setData, setError, handleAct } = useActions<TFormData>({ password: '' })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value
    setData({ password })

    if (!PasswordHelper.isWeakPassword(password)) {
      setError('password', t('passwordError', { length: PasswordHelper.MINIMUM_PASSWORD_LENGTH }))
      return
    }
  }

  const handleSubmit = (data: TFormData) => {
    if (onSubmit) {
      onSubmit(data.password)
      return
    }

    navigate('/login-security-setup/2', { state: { password: data.password } })
  }

  return (
    <Fragment>
      <p className="mt-15 text-sm text-white">{t('formTitle')}</p>
      <form className="mt-6 flex w-full grow flex-col items-center justify-between" onSubmit={handleAct(handleSubmit)}>
        <Input
          testId="security-setup-first-password"
          type="password"
          value={actionData.password}
          onChange={handleChange}
          placeholder={t('passwordPlaceholder')}
          errorMessage={actionState.errors.password}
          autoFocus
        />

        <Button
          label={commonT('general.continue')}
          className="w-64"
          type="submit"
          disabled={!actionState.isValid || actionState.isActing}
          {...TestHelper.buildTestObject('security-setup-first-submit')}
        />
      </form>
    </Fragment>
  )
}

export default LoginPasswordSecuritySetupStep1Page
