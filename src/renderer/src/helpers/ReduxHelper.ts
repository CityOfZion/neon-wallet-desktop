import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import { getLanguageMiddleware } from '@renderer/store/middlewares/language'
import { getNetworkMiddleware } from '@renderer/store/middlewares/network'
import { getTemporaryDataMiddleware } from '@renderer/store/middlewares/temporary-data'
import { getAuthReducer } from '@renderer/store/reducers/auth'
import { getContactReducer } from '@renderer/store/reducers/contact'
import { getSettingsReducer } from '@renderer/store/reducers/settings'
import { getUtilityReducer } from '@renderer/store/reducers/utility'

export class ReduxHelper {
  static store: ReturnType<typeof this.setup>
  static persistor: ReturnType<typeof persistStore>

  static getReducer() {
    return combineReducers({
      utility: getUtilityReducer(),
      auth: getAuthReducer(),
      contact: getContactReducer(),
      settings: getSettingsReducer(),
    })
  }

  static setup() {
    const reducer = this.getReducer()
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

    this.store = configuredStore
    this.persistor = persistStore(this.store)

    return configuredStore
  }

  static async waitForBootstrap() {
    return new Promise<void>(resolve => {
      const { bootstrapped } = this.persistor.getState()
      if (bootstrapped) {
        resolve()
        return
      }

      const unsubscribe = this.persistor.subscribe(() => {
        const { bootstrapped } = this.persistor.getState()
        if (bootstrapped) {
          unsubscribe()
          resolve()
        }
      })
    })
  }
}
