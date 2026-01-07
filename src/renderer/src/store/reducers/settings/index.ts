import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import isEqual from 'lodash/isEqual'
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { LanguageHelper } from '@renderer/helpers/LanguageHelper'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { ISettingsState, type TNetworkProfile, type TSelectedNetworks } from '@shared/types/store'

import { settingsSliceReducers } from './reducers'

export interface ISettingsReducer {
  data: ISettingsState
}

export let settingsReducerActions: CaseReducerActions<typeof settingsSliceReducers, string>

export function getSettingsReducer() {
  const { t } = SharedI18nextHelper.get()

  const defaultProfile: TNetworkProfile = {
    id: ConstantsHelper.defaultNetworkProfileId,
    name: t('common:general.default'),
    networkByBlockchain: {
      arbitrum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
      base: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.base.defaultNetwork,
      ethereum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.ethereum.defaultNetwork,
      neo3: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3.defaultNetwork,
      neoLegacy: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
      neox: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neox.defaultNetwork,
      polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
    },
  }

  const testProfile: TNetworkProfile = {
    id: ConstantsHelper.testNetworkProfileId,
    name: t('common:general.test'),
    networkByBlockchain: Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName).reduce(
      (accumulator, service) => {
        accumulator[service.name] =
          service.availableNetworks.find(network => network.type === 'testnet') ?? service.defaultNetwork
        return accumulator
      },
      {} as TSelectedNetworks
    ),
  }

  const settingsReducerInitialState: ISettingsReducer = {
    data: {
      hasPassword: false,
      isFirstTime: true,
      currency: CurrencyHelper.defaultCurrency,
      language: LanguageHelper.defaultLanguage,
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
      networkProfiles: [defaultProfile, testProfile],
      selectedNetworkProfile: defaultProfile,
      canShowVoteNeo3SupportUsModal: true,
      selectedWallet: undefined,
      selectedAccount: undefined,
      showSideBar: true,
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
          polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
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
          base: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.base.defaultNetwork,
          arbitrum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            base: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.base.defaultNetwork,
            arbitrum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            base: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.base.defaultNetwork,
            arbitrum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.arbitrum.defaultNetwork,
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
          polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
        },
        networkProfiles: state.data.networkProfiles.map(profile => ({
          ...profile,
          networkByBlockchain: {
            ...profile.networkByBlockchain,
            polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
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
        language: LanguageHelper.defaultLanguage,
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
            neoLegacy: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
          },
        })),
        selectedNetworkProfile: {
          ...state.data.selectedNetworkProfile,
          networkByBlockchain: {
            ...state.data.selectedNetworkProfile.networkByBlockchain,
            neoLegacy: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
          },
        },
      },
    }),
    11: (state: any) => {
      const newNetworkProfiles = state.data.networkProfiles

      if (newNetworkProfiles.length <= 1) {
        newNetworkProfiles.push(testProfile)
      }

      return {
        ...state,
        data: {
          ...state.data,
          networkProfiles: newNetworkProfiles,
        },
      }
    },
    12: (state: any) => {
      const [firstNetworkProfile] = state.data.networkProfiles
      const isCurrentNetworkProfile = isEqual(firstNetworkProfile, state.data.selectedNetworkProfile)

      firstNetworkProfile.networkByBlockchain.neox =
        BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neox.defaultNetwork

      return {
        ...state,
        data: {
          ...state.data,
          selectedNetworkProfile: isCurrentNetworkProfile ? firstNetworkProfile : state.data.selectedNetworkProfile,
        },
      }
    },
  }

  const settingsReducerConfig: PersistConfig<ISettingsReducer> = {
    key: 'settingsReducer',
    storage: storage,
    version: 12,
    migrate: createMigrate(settingsReducerMigrations),
    blacklist: ['showSideBar'],
  }

  const settingsSlice = createSlice({
    name: settingsReducerConfig.key,
    initialState: settingsReducerInitialState,
    reducers: settingsSliceReducers,
  })

  settingsReducerActions = settingsSlice.actions

  return persistReducer(settingsReducerConfig, settingsSlice.reducer)
}
