import { Outlet } from 'react-router-dom'
import { useBeforeLogin } from '@renderer/hooks/useBeforeLogin'

// It should be a different component because the contexts are in the parent component
export const Child = () => {
  useBeforeLogin()

  return <Outlet />
}
