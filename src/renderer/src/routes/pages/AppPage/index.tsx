import { Fragment } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { CustomProfileBanner } from '@renderer/components/CustomProfileBanner'
import { useAfterLogin } from '@renderer/hooks/useAfterLogin'
import { useLoginSessionSelector } from '@renderer/hooks/useSettingsSelector'

export const AppPage = () => {
  useAfterLogin()

  const { loginSession } = useLoginSessionSelector()
  const location = useLocation()

  if (!loginSession) {
    return <Navigate to="/login" state={{ from: location.pathname }} />
  }

  return (
    <Fragment>
      <CustomProfileBanner />
      <Outlet />
    </Fragment>
  )
}
