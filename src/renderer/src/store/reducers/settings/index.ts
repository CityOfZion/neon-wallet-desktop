import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { availableCurrencies } from '@renderer/constants/currency'
import { defaultLanguage } from '@renderer/constants/language'
import { DEFAULT_NETWORK_PROFILE_ID } from '@renderer/constants/networks'
import { bsAggregator, getBlockchainNames } from '@renderer/libs/blockchain-service'
import { getI18next } from '@shared/libs/i18next'
import { ISettingsState, type TNetworkProfile, type TSelectedNetworks } from '@shared/types/store'

import { settingsSliceReducers } from './reducers'

export interface ISettingsReducer {
  data: ISettingsState
}

export let settingsReducerActions: CaseReducerActions<typeof settingsSliceReducers, string>

export function getSettingsReducer() {
  const { t } = getI18next()

  // It is necessary to do that way because bs-electron uses getters that will fail during serialization
  // So we need to get each property individually to build the default network object
  const networkByBlockchain = getBlockchainNames().reduce((accumulator, blockchain) => {
    const network = bsAggregator.blockchainServicesByName[blockchain].defaultNetwork

    accumulator[blockchain] = {
      id: network.id,
      name: network.name,
      type: network.type,
      url: network.url,
      isAutomatic: true,
    }
    return accumulator
  }, {} as TSelectedNetworks)

  const defaultProfile: TNetworkProfile = {
    id: DEFAULT_NETWORK_PROFILE_ID,
    name: t('common:general.default'),
    networkByBlockchain,
  }

  const settingsReducerInitialState: ISettingsReducer = {
    data: {
      hasPassword: false,
      isFirstTime: true,
      currency: availableCurrencies[0],
      language: defaultLanguage,
      overTheAirInfo: {
        shouldUpdate: true,
      },
      customNetworks: {
        ethereum: [],
        neo3: [],
        neoLegacy: [],
        neox: [],
        polygon: [],
        base: [],
        arbitrum: [],
      },
      networkProfiles: [defaultProfile],
      selectedNetworkProfile: defaultProfile,
      canShowVoteNeo3SupportUsModal: true,
    },
  }

  const settingsReducerMigrations = {
    0: ({ _persist, ...state }: any) => ({
      data: {
        ...state,
        securityType: undefined,
        hasPassword: state.securityType === 'password',
      },
      _persist,
    }),
    1: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        customNetworks: {
          ...state.data.customNetworks,
          polygon: [],
        },
        selectedNetworkByBlockchain: {
          ...state.data.selectedNetworkByBlockchain,
          polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        },
      },
    }),
    2: (state: any) => {
      delete state.data.hasOverTheAirUpdates

      return {
        ...state,
        data: {
          ...state.data,
          overTheAirInfo: {
            shouldUpdate: true,
          },
        },
      }
    },
    3: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        customNetworks: {
          ...state.data.customNetworks,
          base: [],
          arbitrum: [],
        },
        selectedNetworkByBlockchain: {
          ...state.data.selectedNetworkByBlockchain,
          base: bsAggregator.blockchainServicesByName.base.defaultNetwork,
          arbitrum: bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            base: bsAggregator.blockchainServicesByName.base.defaultNetwork,
            arbitrum: bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            base: bsAggregator.blockchainServicesByName.base.defaultNetwork,
            arbitrum: bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
          },
        },
      },
    }),
    4: (state: any) => {
      delete state.data.unlockedSkinIds

      return {
        ...state,
        data: state.data,
      }
    },
    // This function will set the Polygon networks with the current RPC
    5: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        customNetworks: {
          ...state.data.customNetworks,
          polygon: [],
        },
        selectedNetworkByBlockchain: {
          ...state.data.selectedNetworkByBlockchain,
          polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            polygon: bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        },
      },
    }),
    6: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        canShowVoteNeo3SupportUsModal: true,
      },
    }),
    7: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        language: defaultLanguage,
      },
    }),
    8: (state: any) => {
      delete state.data.selectedNetworkByBlockchain
      return state
    },
    9: (state: any) => {
      return {
        ...state,
        data: {
          ...state.data,
          networkProfiles: [defaultProfile],
          selectedNetworkProfile: defaultProfile,
        },
      }
    },
    10: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        networkProfiles: state.data.networkProfiles.map((profile: any) => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            neoLegacy: bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            neoLegacy: bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
          },
        },
      },
    }),
  }

  const settingsReducerConfig: PersistConfig<ISettingsReducer> = {
    key: 'settingsReducer',
    storage: storage,
    version: 10,
    migrate: createMigrate(settingsReducerMigrations),
  }

  const settingsSlice = createSlice({
    name: settingsReducerConfig.key,
    initialState: settingsReducerInitialState,
    reducers: settingsSliceReducers,
  })

  settingsReducerActions = settingsSlice.actions

  return persistReducer(settingsReducerConfig, settingsSlice.reducer)
}
