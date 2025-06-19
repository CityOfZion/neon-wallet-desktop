import { createSlice } from '@reduxjs/toolkit'
import { availableCurrencies } from '@renderer/constants/currency'
import { defaultLanguage } from '@renderer/constants/language'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { ISettingsState } from '@shared/@types/store'
import { createMigrate, PersistConfig, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { settingsSliceReducers } from './reducers'

export interface ISettingsReducer {
  data: ISettingsState
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
    selectedNetworkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
    networkProfiles: [DEFAULT_NETWORK_PROFILE],
    selectedNetworkProfile: DEFAULT_NETWORK_PROFILE,
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
        polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
      },
      networkProfiles: state.data.networkProfiles.map(profile => ({
        ...profile,
        networkByBlockchain: {
          ...profile.networkByBlockchain,
          polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
        },
      })),
      selectedNetworkProfile: {
        ...state.data.selectedNetworkProfile,
        networkByBlockchain: {
          ...state.data.selectedNetworkProfile.networkByBlockchain,
          polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
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
        base: DEFAULT_NETWORK_BY__BLOCKCHAIN.base,
        arbitrum: DEFAULT_NETWORK_BY__BLOCKCHAIN.arbitrum,
      },
      networkProfiles: state.data.networkProfiles.map(profile => ({
        ...profile,
        networkByBlockchain: {
          ...profile.networkByBlockchain,
          base: DEFAULT_NETWORK_BY__BLOCKCHAIN.base,
          arbitrum: DEFAULT_NETWORK_BY__BLOCKCHAIN.arbitrum,
        },
      })),
      selectedNetworkProfile: {
        ...state.data.selectedNetworkProfile,
        networkByBlockchain: {
          ...state.data.selectedNetworkProfile.networkByBlockchain,
          base: DEFAULT_NETWORK_BY__BLOCKCHAIN.base,
          arbitrum: DEFAULT_NETWORK_BY__BLOCKCHAIN.arbitrum,
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
        polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
      },
      networkProfiles: state.data.networkProfiles.map(profile => ({
        ...profile,
        networkByBlockchain: {
          ...profile.networkByBlockchain,
          polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
        },
      })),
      selectedNetworkProfile: {
        ...state.data.selectedNetworkProfile,
        networkByBlockchain: {
          ...state.data.selectedNetworkProfile.networkByBlockchain,
          polygon: DEFAULT_NETWORK_BY__BLOCKCHAIN.polygon,
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
}

export const settingsReducerConfig: PersistConfig<ISettingsReducer> = {
  key: 'settingsReducer',
  storage: storage,
  version: 7,
  migrate: createMigrate(settingsReducerMigrations),
}

const settingsSlice = createSlice({
  name: settingsReducerConfig.key,
  initialState: settingsReducerInitialState,
  reducers: settingsSliceReducers,
  extraReducers: builder => {
    builder.addCase(PURGE, () => settingsReducerInitialState)
  },
})

export const settingsReducerActions = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer
