import { createSlice } from '@reduxjs/toolkit'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { THiddenTokenByBlockchain, TLastIndexesByWallet, TMigrationsNeo3, TSwapRecord } from '@shared/@types/store'
import { PersistConfig, PersistedState, PURGE } from 'redux-persist'
import createMigrate from 'redux-persist/es/createMigrate'
import getStoredState from 'redux-persist/es/getStoredState'
import storage from 'redux-persist/lib/storage'

import { utilitySliceReducers } from './reducers'

export interface IUtilityReducer {
  inMemoryData: {
    pendingTransactions: TUseTransactionsTransfer[]
  }
  data: {
    unlockedSkinIds: string[]
    swapRecords: TSwapRecord[]
    lastIndexesByWallet: TLastIndexesByWallet
    hiddenTokensByBlockchain: THiddenTokenByBlockchain
    migrationsNeo3: TMigrationsNeo3
  }
}

const utilityReducerInitialState: IUtilityReducer = {
  inMemoryData: {
    pendingTransactions: [],
  },
  data: {
    swapRecords: [],
    unlockedSkinIds: [],
    lastIndexesByWallet: {},
    hiddenTokensByBlockchain: {},
    migrationsNeo3: {},
  },
}

const utilityReducerMigrations = {
  0: (state: any) => {
    const authStore = window.localStorage.getItem('persist:authReducer')
    const settingsStore = window.localStorage.getItem('persist:settingsReducer')

    if (!authStore || !settingsStore) return state

    const authStoreJSON = JSON.parse(authStore)
    const swapRecords = JSON.parse(authStoreJSON.data).swapRecords ?? []

    const settingsStoreJSON = JSON.parse(settingsStore)
    const unlockedSkinIds = JSON.parse(settingsStoreJSON.data).unlockedSkinIds ?? []

    return {
      ...state,
      data: {
        ...state.data,
        swapRecords,
        unlockedSkinIds,
      },
    }
  },
}

export const utilityReducerConfig: PersistConfig<IUtilityReducer> = {
  key: 'utilityReducer',
  storage,
  timeout: 0,
  blacklist: ['inMemoryData'],
  version: 0,
  migrate: createMigrate(utilityReducerMigrations),
  getStoredState: async (config: any) => {
    const storedState = await config.storage.getItem(`persist:${config.key}`)
    if (storedState) {
      return (await getStoredState(config)) as PersistedState
    }

    return {
      ...utilityReducerInitialState,
      _persist: {
        rehydrated: true,
        version: -1,
      },
    }
  },
}

const utilitySlice = createSlice({
  name: 'utilityReducer',
  initialState: utilityReducerInitialState,
  reducers: utilitySliceReducers,
  extraReducers: builder => {
    builder.addCase(PURGE, () => utilityReducerInitialState)
  },
})

export const utilityReducerActions = utilitySlice.actions
export const utilityReducer = utilitySlice.reducer
