import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LanguageHelper } from '@renderer/helpers/LanguageHelper'

import { type TNetworkProfile } from '@shared/types/store'

export function getSettingsMigrations(defaultProfile: TNetworkProfile, testProfile: TNetworkProfile) {
  return {
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
      const neoxNetwork = defaultProfile.networkByBlockchain.neox
      const newSelectedNetworkProfile = state.data.selectedNetworkProfile

      if (newSelectedNetworkProfile.id === defaultProfile.id) {
        newSelectedNetworkProfile.networkByBlockchain.neox = neoxNetwork
      }

      const newNetworkProfiles = state.data.networkProfiles.map(profile => {
        if (profile.id === defaultProfile.id) {
          profile.networkByBlockchain.neox = neoxNetwork

          return profile
        }

        return profile
      })

      return {
        ...state,
        data: {
          ...state.data,
          networkProfiles: newNetworkProfiles,
          selectedNetworkProfile: newSelectedNetworkProfile,
        },
      }
    },
  }
}
