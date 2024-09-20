import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import AccountReducer, { accountReducerConfig } from './reducers/AccountReducer'
import ContactReducer, { contactReducerConfig } from './reducers/ContactReducer'
import SettingsReducer, { settingsReducerConfig } from './reducers/SettingsReducer'
import WalletReducer, { walletReducerConfig } from './reducers/WalletReducer'

const persistedWalletReducer = persistReducer(walletReducerConfig, WalletReducer)
const persistedAccountReducer = persistReducer(accountReducerConfig, AccountReducer)
const persistedSettingsReducer = persistReducer(settingsReducerConfig, SettingsReducer)
const persistedContactReducer = persistReducer(contactReducerConfig, ContactReducer)

export class RootStore {
  static reducers = combineReducers({
    wallet: persistedWalletReducer,
    account: persistedAccountReducer,
    settings: persistedSettingsReducer,
    contact: persistedContactReducer,
  })

  static store = configureStore({
    reducer: RootStore.reducers,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })

  static persistor = persistStore(RootStore.store)
}
