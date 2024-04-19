import { useEffect } from 'react'
import { Provider as StoreProvider } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { WalletConnectWalletProvider } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { ModalRouterProvider } from '@renderer/contexts/ModalRouterContext'
import { useBeforeLogin } from '@renderer/hooks/useBeforeLogin'
import { queryClient } from '@renderer/libs/query'
import { ToastProvider } from '@renderer/libs/sonner'
import { walletConnectOptions } from '@renderer/libs/walletConnectSDK'
import { modalsRouter } from '@renderer/routes/modalsRouter'
import { RootStore } from '@renderer/store/RootStore'
import * as Sentry from '@sentry/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistGate } from 'redux-persist/integration/react'

// It should be a different component because the contexts are in the parent component
const Child = () => {
  useBeforeLogin()
  return <Outlet />
}

export const RootPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/login')
  }, [navigate])

  return (
    <Sentry.ErrorBoundary>
      <StoreProvider store={RootStore.store}>
        <PersistGate persistor={RootStore.persistor}>
          <WalletConnectWalletProvider options={walletConnectOptions}>
            <QueryClientProvider client={queryClient}>
              <ModalRouterProvider routes={modalsRouter}>
                <Child />
                <ToastProvider />
              </ModalRouterProvider>
            </QueryClientProvider>
          </WalletConnectWalletProvider>
        </PersistGate>
      </StoreProvider>
    </Sentry.ErrorBoundary>
  )
}
