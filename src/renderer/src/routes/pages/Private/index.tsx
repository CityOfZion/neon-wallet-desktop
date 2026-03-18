import { cloneElement, lazy, Suspense } from 'react'

import { AnimatePresence } from 'motion/react'
import { Navigate, useLocation, useMatch, useOutlet } from 'react-router'

import { LazyHelper } from '@renderer/helpers/LazyHelper'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useShowNewsModalSelector, useShowSideBarSelector } from '@renderer/hooks/useSettingsSelector'

import { Sidebar } from './Sidebar'

const CustomProfileBanner = lazy(() => import('@renderer/components/CustomProfileBanner'))
const HardwareWalletManagerSetup = LazyHelper.delayedLazy(() => import('./HardwareWalletManagerSetup'), 0)
const DeeplinkManagerSetup = LazyHelper.delayedLazy(() => import('./DeeplinkManagerSetup'), 0)
const HotKeysManagerSetup = LazyHelper.delayedLazy(() => import('./HotKeysManagerSetup'), 0)
const WalletConnectManagerSetup = LazyHelper.delayedLazy(() => import('./WalletConnectManagerSetup'), 1000)
const AccountTasksManagerSetup = LazyHelper.delayedLazy(() => import('./AccountTasksManagerSetup'), 10000)
const WalletTasksManagerSetup = LazyHelper.delayedLazy(() => import('./WalletTasksManagerSetup'), 15000)

const PrivatePage = () => {
  const { loginSession } = useLoginSessionSelector()
  const { showSideBar } = useShowSideBarSelector()
  const { showNewsModal } = useShowNewsModalSelector()
  const { modalNavigate } = useModalNavigate()
  const location = useLocation()
  const outlet = useOutlet()
  const match = useMatch('/:rootPath/*')

  useMountUnsafe(() => {
    if (loginSession && showNewsModal) {
      modalNavigate('news')
    }
  })

  if (!loginSession) {
    return <Navigate to="/login/password" state={{ from: location.pathname }} />
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <AnimatePresence initial={false}>{showSideBar && <Sidebar />}</AnimatePresence>

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

      <Suspense fallback={null}>
        <WalletConnectManagerSetup />
      </Suspense>

      {outlet && cloneElement(outlet, { key: match?.params.rootPath })}
    </div>
  )
}

export default PrivatePage
