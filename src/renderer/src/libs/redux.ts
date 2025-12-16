import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import { getLanguageMiddleware } from '@renderer/store/middlewares/language'
import { getNetworkMiddleware } from '@renderer/store/middlewares/network'
import { getTemporaryDataMiddleware } from '@renderer/store/middlewares/temporary-data'
import { getAuthReducer } from '@renderer/store/reducers/auth'
import { getContactReducer } from '@renderer/store/reducers/contact'
import { getSettingsReducer } from '@renderer/store/reducers/settings'
import { getUtilityReducer } from '@renderer/store/reducers/utility'

export let store: ReturnType<typeof setupStore>
export let persistor: ReturnType<typeof persistStore>

export function getReducer() {
  return combineReducers({
    utility: getUtilityReducer(),
    auth: getAuthReducer(),
    contact: getContactReducer(),
    settings: getSettingsReducer(),
  })
}

export function setupStore() {
  const reducer = getReducer()
  const middlewares = [getLanguageMiddleware(), getNetworkMiddleware(), getTemporaryDataMiddleware()]

  const configuredStore = configureStore({
    reducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(middlewares),
  })

  store = configuredStore
  persistor = persistStore(store)

  return configuredStore
}

export async function waitForBootstrap() {
  return new Promise<void>(resolve => {
    const { bootstrapped } = persistor.getState()
    if (bootstrapped) {
      resolve()
      return
    }

    const unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState()
      if (bootstrapped) {
        unsubscribe()
        resolve()
      }
    })
  })
}
