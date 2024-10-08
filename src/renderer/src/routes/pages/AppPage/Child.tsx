import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import { CustomProfileBanner } from '@renderer/components/CustomProfileBanner'
import { useAfterLogin } from '@renderer/hooks/useAfterLogin'

export const Child = () => {
  useAfterLogin()

  return (
    <Fragment>
      <CustomProfileBanner />
      <Outlet />
    </Fragment>
  )
}
