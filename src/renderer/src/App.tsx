import { Provider as StoreProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { setupSentryWrapper } from '@renderer/setup/sentryReact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistGate } from 'redux-persist/integration/react'

import { ModalRouterProvider } from './contexts/ModalRouterContext'
import { modalRoutes } from './routes/modals'
import { pageRouter } from './routes/pages'
import { RootStore } from './store/RootStore'

const queryClient = new QueryClient()

const AppReact = (): JSX.Element => {
  return (
    <StoreProvider store={RootStore.store}>
      <PersistGate persistor={RootStore.persistor}>
        <QueryClientProvider client={queryClient}>
          <ModalRouterProvider routes={modalRoutes}>
            <RouterProvider router={pageRouter} />
          </ModalRouterProvider>
        </QueryClientProvider>
      </PersistGate>
    </StoreProvider>
  )
}

export const App = setupSentryWrapper(AppReact)
