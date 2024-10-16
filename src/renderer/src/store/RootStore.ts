import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import AuthReducer, { authReducerConfig } from './reducers/AuthReducer'
import ContactReducer, { contactReducerConfig } from './reducers/ContactReducer'
import SettingsReducer, { settingsReducerConfig } from './reducers/SettingsReducer'

const persistedAuthReducer = persistReducer(authReducerConfig, AuthReducer)
const persistedSettingsReducer = persistReducer(settingsReducerConfig, SettingsReducer)
const persistedContactReducer = persistReducer(contactReducerConfig, ContactReducer)

export class RootStore {
  static reducers = combineReducers({
    auth: persistedAuthReducer,
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
