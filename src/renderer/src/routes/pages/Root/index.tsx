import { lazy, Suspense, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider as StoreProvider } from 'react-redux'
import { Outlet, useNavigate } from 'react-router'

import { ScreenLoader } from '@renderer/components/ScreenLoader'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LazyHelper } from '@renderer/helpers/LazyHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { ReduxHelper } from '@renderer/helpers/ReduxHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'

import { modalsRouter } from '@renderer/routes/modals-router'

import { ModalRouterProvider } from '@renderer/contexts/ModalRouterContext'
import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

const ToastProvider = lazy(() =>
  import('@renderer/helpers/ToastHelper').then(module => ({ default: module.ToastHelper.Provider }))
)
const DeeplinkManagerSetup = LazyHelper.delayedLazy(() => import('./DeeplinkManagerSetup'), 1000)
const OverTheAirManagerSetup = LazyHelper.delayedLazy(() => import('./OverTheAirManagerSetup'), 5000)
const HotKeysManagerSetup = LazyHelper.delayedLazy(() => import('./HotKeysManagerSetup'))

const RootPage = () => {
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)

  useMountUnsafe(async () => {
    try {
      SharedEnvHelper.setup()
      await Promise.allSettled([SharedI18nextHelper.setup(), BlockchainServiceHelper.setup(), WalletKitHelper.setup()])
      ReduxHelper.setup()
      await ReduxHelper.waitForBootstrap()

      const state = ReduxHelper.store.getState()
      if (state.settings.data.isFirstTime) {
        navigate('/welcome')
        return
      }

      ReduxHelper.store.dispatch(settingsReducerActions.setSelectedWallet(undefined))
      ReduxHelper.store.dispatch(settingsReducerActions.setSelectedAccount(undefined))

      navigate('/login/password')
    } catch (error) {
      LoggerHelper.sentry(error, { where: 'RootPage', operation: 'setup' })
    } finally {
      setReady(true)
    }
  })

  if (!ready) {
    return <ScreenLoader />
  }

  return (
    <StoreProvider store={ReduxHelper.store}>
      <QueryClientProvider client={ReactQueryHelper.client}>
        <ModalRouterProvider router={modalsRouter}>
          <Outlet />
          <Suspense fallback={null}>
            <OverTheAirManagerSetup />
            <DeeplinkManagerSetup />
            <HotKeysManagerSetup />
          </Suspense>
          <Suspense fallback={null}>
            <ToastProvider />
          </Suspense>
        </ModalRouterProvider>
      </QueryClientProvider>
    </StoreProvider>
  )
}

export default RootPage
