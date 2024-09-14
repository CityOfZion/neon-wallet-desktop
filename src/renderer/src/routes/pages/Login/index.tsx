import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Link } from '@renderer/components/Link'
import { useActions } from '@renderer/hooks/useActions'
import { useLogin } from '@renderer/hooks/useLogin'
import { useAppSelector } from '@renderer/hooks/useRedux'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'
import { WelcomeTabItemType } from '@renderer/layouts/WelcomeWithTabs/WelcomeTabs'

type TFormData = {
  password: string
}

export const LoginPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'login' })
  const { ref: isFirstTimeRef } = useAppSelector(state => state.settings.isFirstTime)
  const { ref: hasLoginRef } = useAppSelector(state => state.settings.hasLogin)
  const navigate = useNavigate()
  const { login } = useLogin()

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
      await login(data.password)
      navigate('/app/portfolio/overview')
    } catch (error: any) {
      setError('password', t('invalidPassword'))
    }
  }

  useEffect(() => {
    if (isFirstTimeRef.current) {
      navigate('/welcome')

      return
    }

    if (!hasLoginRef.current) navigate('/neon-account')
  }, [navigate, isFirstTimeRef, hasLoginRef])

  return (
    <WelcomeWithTabsLayout tabItemType={WelcomeTabItemType.NEON_ACCOUNT}>
      <form className="w-full flex-grow flex flex-col justify-between items-center" onSubmit={handleAct(handleSubmit)}>
        <div className={'flex flex-col w-full'}>
          <div className="flex flex-col w-full gap-y-6">
            <p className="text-white text-sm text-center">{t('text')}</p>

            <Input
              type="password"
              value={actionData.password}
              onChange={handleChangePassword}
              placeholder={t('passwordPlaceholder')}
              errorMessage={actionState.errors.password}
              autoFocus
              className={'placeholder:text-white'}
            />
          </div>

          <Link
            to={'/forgotten-password'}
            label={t('forgotPassword')}
            colorSchema={'neon'}
            variant={'text-slim'}
            className={'mt-2 w-fit mx-auto p-4'}
          />
        </div>

        <Button
          label={t('buttonLoginLabel')}
          className={'w-[250px]'}
          variant={'contained'}
          type="submit"
          disabled={!actionState.isValid || actionState.isActing}
          loading={actionState.isActing}
        />
      </form>
    </WelcomeWithTabsLayout>
  )
}
