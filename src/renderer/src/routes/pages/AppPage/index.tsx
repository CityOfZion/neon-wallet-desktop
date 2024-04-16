import { Fragment } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RootState } from '@renderer/@types/store'
import { TestnetBanner } from '@renderer/components/TestnetBanner'
import { useAfterLogin } from '@renderer/hooks/useAfterLogin'
import { useAppSelector } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'

export const AppPage = () => {
  useAfterLogin()

  const { value: securityType } = useAppSelector((state: RootState) => state.settings.securityType)
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const location = useLocation()

  if (securityType !== 'password' || !encryptedPassword) {
    return <Navigate to={'/login'} state={{ from: location.pathname }} />
  }

  return (
    <Fragment>
      <TestnetBanner />
      <Outlet />
    </Fragment>
  )
}
