import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { PersistConfig, PersistedState, persistReducer } from 'redux-persist'
import createMigrate from 'redux-persist/es/createMigrate'
import getStoredState from 'redux-persist/es/getStoredState'
import storage from 'redux-persist/lib/storage'

import { type TUseTransactionsTransaction } from '@shared/types/hooks'
import { THiddenTokenByBlockchain, TLastIndexesByWallet, TSwapRecord } from '@shared/types/store'

import { getUtilityMigrations } from './migrations'
import { utilitySliceReducers } from './reducers'

export interface IUtilityReducer {
  inMemoryData: {
    pendingTransactions: TUseTransactionsTransaction[]
  }
  data: {
    unlockedSkinIds: string[]
    swapRecords: TSwapRecord[]
    lastIndexesByWallet: TLastIndexesByWallet
    hiddenTokensByBlockchain: THiddenTokenByBlockchain
  }
}

export let utilityReducerActions: CaseReducerActions<typeof utilitySliceReducers, string>

export function getUtilityReducer() {
  const utilityMigrations = getUtilityMigrations()

  const utilityReducerInitialState: IUtilityReducer = {
    inMemoryData: {
      pendingTransactions: [],
    },
    data: {
      swapRecords: [],
      unlockedSkinIds: [],
      lastIndexesByWallet: {},
      hiddenTokensByBlockchain: {},
    },
  }

  const utilityReducerConfig: PersistConfig<IUtilityReducer> = {
    key: 'utilityReducer',
    storage,
    timeout: 0,
    blacklist: ['inMemoryData'],
    version: 2,
    migrate: createMigrate(utilityMigrations),
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
  })

  utilityReducerActions = utilitySlice.actions

  return persistReducer(utilityReducerConfig, utilitySlice.reducer)
}
