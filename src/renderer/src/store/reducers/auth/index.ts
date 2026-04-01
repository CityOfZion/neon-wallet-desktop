import { CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, getStoredState, PersistConfig, PersistedState, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { TLoginSession, TLoginSessionType, TNotification, TWallet } from '@shared/types/store'

import { getAuthMigrations } from './migrations'
import { authSliceReducers } from './reducers'

export type TApplicationDataByLoginType = {
  [K in TLoginSessionType]: {
    wallets: TWallet[]
    notifications: TNotification[]
  }
}

export type TAuthReducer = {
  memoryData: {
    loginSession?: TLoginSession
  }
  data: {
    applicationDataByLoginType: TApplicationDataByLoginType
  }
}

export let authReducerActions: CaseReducerActions<typeof authSliceReducers, string>

export function getAuthReducer() {
  const authMigrations = getAuthMigrations()

  const authReducerInitialState: TAuthReducer = {
    memoryData: {
      loginSession: undefined,
    },
    data: {
      applicationDataByLoginType: {
        hardware: { wallets: [], notifications: [] },
        key: { wallets: [], notifications: [] },
        password: { wallets: [], notifications: [] },
      },
    },
  }

  const authReducerConfig: PersistConfig<TAuthReducer> = {
    key: 'authReducer',
    storage,
    blacklist: ['memoryData'],
    version: 7,
    migrate: createMigrate(authMigrations),
    // It is necessary to check if the stored state is empty, because the redux-persist library does not call the migrate function when the state is empty
    getStoredState: async config => {
      const storedState = await config.storage.getItem('persist:authReducer')

      if (storedState) {
        return (await getStoredState(config)) as PersistedState
      }

      return {
        ...authReducerInitialState,
        _persist: {
          rehydrated: true,
          version: -1,
        },
      }
    },
  }

  const authSlice = createSlice({
    name: authReducerConfig.key,
    initialState: authReducerInitialState,
    reducers: authSliceReducers,
  })

  authReducerActions = authSlice.actions

  return persistReducer(authReducerConfig, authSlice.reducer)
}
