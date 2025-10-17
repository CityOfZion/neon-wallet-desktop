import { Fragment, lazy, Suspense } from 'react'

import { Navigate, Outlet, useLocation } from 'react-router'

import { LazyHelper } from '@renderer/helpers/LazyHelper'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

const CustomProfileBanner = lazy(() => import('@renderer/components/CustomProfileBanner'))
const HardwareWalletManagerSetup = LazyHelper.delayedLazy(() => import('./HardwareWalletManagerSetup'), 0)
const DeeplinkManagerSetup = LazyHelper.delayedLazy(() => import('./DeeplinkManagerSetup'), 0)
const HotKeysManagerSetup = LazyHelper.delayedLazy(() => import('./HotKeysManagerSetup'), 0)
const AccountTasksManagerSetup = LazyHelper.delayedLazy(() => import('./AccountTasksManagerSetup'), 10000)
const WalletTasksManagerSetup = LazyHelper.delayedLazy(() => import('./WalletTasksManagerSetup'), 15000)

const PrivatePage = () => {
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const location = useLocation()

  if (!currentLoginSession) {
    return <Navigate to="/login/password" state={{ from: location.pathname }} />
  }

  return (
    <Fragment>
      <Suspense fallback={null}>
        <CustomProfileBanner />
      </Suspense>

      <Suspense fallback={null}>
        <HardwareWalletManagerSetup />
        <DeeplinkManagerSetup />
      </Suspense>

      <Suspense fallback={null}>
        <HotKeysManagerSetup />
      </Suspense>

      <Suspense fallback={null}>
        <AccountTasksManagerSetup />
      </Suspense>

      <Suspense fallback={null}>
        <WalletTasksManagerSetup />
      </Suspense>

      <Outlet />
    </Fragment>
  )
}

export default PrivatePage
