import { lazy, Suspense, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider as StoreProvider } from 'react-redux'
import { Outlet, useNavigate } from 'react-router'

import { ScreenLoader } from '@renderer/components/ScreenLoader'

import { LazyHelper } from '@renderer/helpers/LazyHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'

import { modalsRouter } from '@renderer/routes/modals-router'

import { ModalRouterProvider } from '@renderer/contexts/ModalRouterContext'
import { setupBSAggregator } from '@renderer/libs/blockchain-service'
import { queryClient } from '@renderer/libs/query'
import { setupStore, store, waitForBootstrap } from '@renderer/libs/redux'
import { setupWalletKit } from '@renderer/libs/wallet-connect'
import { settingsReducerActions } from '@renderer/store/reducers/settings'
import * as Sentry from '@sentry/electron/renderer'
import { setupI18next } from '@shared/libs/i18next'

const ToastProvider = lazy(() => import('@renderer/libs/sonner'))
const DeeplinkManagerSetup = LazyHelper.delayedLazy(() => import('./DeeplinkManagerSetup'), 1000)
const OverTheAirManagerSetup = LazyHelper.delayedLazy(() => import('./OverTheAirManagerSetup'), 5000)

const RootPage = () => {
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)

  useMountUnsafe(async () => {
    try {
      await Promise.allSettled([setupI18next(), setupBSAggregator(), setupWalletKit()])
      setupStore()
      await waitForBootstrap()

      const state = store.getState()
      if (state.settings.data.isFirstTime) {
        navigate('/welcome')
        return
      }

      store.dispatch(settingsReducerActions.setSelectedWallet(undefined))
      store.dispatch(settingsReducerActions.setSelectedAccount(undefined))

      navigate('/login/password')
    } catch (error) {
      console.error('Error during app initialization:', error)
      Sentry.captureException(error)
    } finally {
      setReady(true)
    }
  })

  if (!ready) {
    return <ScreenLoader />
  }

  return (
    <StoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ModalRouterProvider router={modalsRouter}>
          <Outlet />
          <Suspense fallback={null}>
            <OverTheAirManagerSetup />
            <DeeplinkManagerSetup />
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
