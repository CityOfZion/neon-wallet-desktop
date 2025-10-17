import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { Persistor } from 'redux-persist'
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import { getLanguageMiddleware } from './middlewares/language'
import { getNetworkMiddleware } from './middlewares/network'
import { getTemporaryDataMiddleware } from './middlewares/temporary-data'
import { getAuthReducer } from './reducers/auth'
import { getContactReducer } from './reducers/contact'
import { getSettingsReducer } from './reducers/settings'
import { getUtilityReducer } from './reducers/utility'

export class RootStore {
  static store: ReturnType<typeof RootStore.setupStore>
  static persistor: Persistor

  static getReducer() {
    return combineReducers({
      utility: getUtilityReducer(),
      auth: getAuthReducer(),
      contact: getContactReducer(),
      settings: getSettingsReducer(),
    })
  }

  static setupStore() {
    const reducer = this.getReducer()
    const middlewares = [getLanguageMiddleware(), getNetworkMiddleware(), getTemporaryDataMiddleware()]

    const store = configureStore({
      reducer,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }).concat(middlewares),
    })

    RootStore.store = store
    RootStore.persistor = persistStore(store)
    return store
  }

  static waitForBootstrap(): Promise<void> {
    return new Promise(resolve => {
      const { bootstrapped } = RootStore.persistor.getState()
      if (bootstrapped) {
        resolve()
        return
      }

      const unsubscribe = RootStore.persistor.subscribe(() => {
        const { bootstrapped } = RootStore.persistor.getState()
        if (bootstrapped) {
          unsubscribe()
          resolve()
        }
      })
    })
  }
}
