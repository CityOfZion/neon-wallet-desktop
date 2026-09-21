import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { THiddenTokenByBlockchain } from '@shared/types/store'

export function getUtilityMigrations() {
  return {
    0: (state: any) => {
      const authStore = window.localStorage.getItem('persist:authReducer')
      const settingsStore = window.localStorage.getItem('persist:settingsReducer')

      if (!authStore || !settingsStore) return state

      const authStoreJSON = JSON.parse(authStore)
      const swapRecords = JSON.parse(authStoreJSON.data).swapRecords || []

      const settingsStoreJSON = JSON.parse(settingsStore)
      const unlockedSkinIds = JSON.parse(settingsStoreJSON.data).unlockedSkinIds || []

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
      const neoLegacyService = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neoLegacy

      const migrationsNeo3 = Object.entries(state.data.migrationsNeo3 || {}).reduce((previous, actual) => {
        const key = neoLegacyService.tokenService.normalizeHash(actual[0])

        previous[key] = actual[1]

        return previous
      }, {})

      const hiddenTokensByBlockchain = Object.entries(state.data.hiddenTokensByBlockchain).reduce(
        (previous, actual) => {
          const blockchain = actual[0] as TBlockchainServiceKey
          const tokens = actual[1] as string[] | undefined
          const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

          previous[blockchain] = tokens?.map(token => service.tokenService.normalizeHash(token)) || []

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
    3: (state: any) => {
      const hiddenTokensByBlockchain = state.data.hiddenTokensByBlockchain as THiddenTokenByBlockchain

      return {
        ...state,
        data: {
          ...state.data,
          hiddenTokensByBlockchain: {
            ...hiddenTokensByBlockchain,
            neo3: [...(hiddenTokensByBlockchain.neo3 || []), '0xb249c1c038545a9e9d223f54accd85e457e4909e'],
          },
        },
      }
    },
  }
}
