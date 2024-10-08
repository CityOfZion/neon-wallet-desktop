import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import { Child } from './Child'

export const AppPage = () => {
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const location = useLocation()

  if (!currentLoginSession) {
    return <Navigate to="/login-password" state={{ from: location.pathname }} />
  }

  return <Child />
}
