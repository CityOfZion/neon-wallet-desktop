import { lazy, Suspense, useState } from 'react'

import { WalletConnectWalletProvider } from '@cityofzion/wallet-connect-sdk-wallet-react'
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
import { walletConnectOptions } from '@renderer/libs/walletConnectSDK'
import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { RootStore } from '@renderer/store/RootStore'
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
      setupI18next()
      setupBSAggregator()
      RootStore.setupStore()
      await RootStore.waitForBootstrap()

      const state = RootStore.store.getState()
      if (state.settings.data.isFirstTime) {
        navigate('/welcome')
        return
      }

      RootStore.store.dispatch(settingsReducerActions.setSelectedWallet(undefined))
      RootStore.store.dispatch(settingsReducerActions.setSelectedAccount(undefined))

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
    <StoreProvider store={RootStore.store}>
      <WalletConnectWalletProvider options={walletConnectOptions}>
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
      </WalletConnectWalletProvider>
    </StoreProvider>
  )
}

export default RootPage
