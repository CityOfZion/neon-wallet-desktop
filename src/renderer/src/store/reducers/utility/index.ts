import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { PersistConfig, PersistedState, persistReducer } from 'redux-persist'
import createMigrate from 'redux-persist/es/createMigrate'
import getStoredState from 'redux-persist/es/getStoredState'
import storage from 'redux-persist/lib/storage'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseTransactionsTransfer } from '@shared/types/hooks'
import { THiddenTokenByBlockchain, TLastIndexesByWallet, TSwapRecord } from '@shared/types/store'

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
  }
}

export let utilityReducerActions: CaseReducerActions<typeof utilitySliceReducers, string>

export function getUtilityReducer() {
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
    1: (state: any) => {
      const neoLegacyService = bsAggregator.blockchainServicesByName.neoLegacy

      const migrationsNeo3 = Object.entries(state.data.migrationsNeo3).reduce((previous, actual) => {
        const key = neoLegacyService.tokenService.normalizeHash(actual[0])

        previous[key] = actual[1]

        return previous
      }, {})

      const hiddenTokensByBlockchain = Object.entries(state.data.hiddenTokensByBlockchain).reduce(
        (previous, actual) => {
          const blockchain = actual[0] as TBlockchainServiceKey
          const tokens = actual[1] as string[] | undefined
          const service = bsAggregator.blockchainServicesByName[blockchain]

          previous[blockchain] = tokens?.map(token => service.tokenService.normalizeHash(token)) ?? []

          return previous
        },
        {}
      )

      return {
        ...state,
        data: {
          ...state.data,
          migrationsNeo3,
          hiddenTokensByBlockchain,
        },
      }
    },
    2: (state: any) => {
      delete state.data.migrationsNeo3

      return state
    },
  }

  const utilityReducerConfig: PersistConfig<IUtilityReducer> = {
    key: 'utilityReducer',
    storage,
    timeout: 0,
    blacklist: ['inMemoryData'],
    version: 2,
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
  })

  utilityReducerActions = utilitySlice.actions

  return persistReducer(utilityReducerConfig, utilitySlice.reducer)
}
