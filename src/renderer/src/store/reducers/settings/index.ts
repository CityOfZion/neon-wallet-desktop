import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { LanguageHelper } from '@renderer/helpers/LanguageHelper'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { ISettingsState, type TNetworkProfile, type TSelectedNetworks } from '@shared/types/store'

import { getSettingsMigrations } from './migrations'
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
      bitcoin: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.bitcoin.defaultNetwork,
      ethereum: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.ethereum.defaultNetwork,
      neo3: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3.defaultNetwork,
      neoLegacy: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neoLegacy.defaultNetwork,
      neox: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neox.defaultNetwork,
      polygon: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.polygon.defaultNetwork,
      solana: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.solana.defaultNetwork,
    },
  }

  const testProfile: TNetworkProfile = {
    id: ConstantsHelper.testNetworkProfileId,
    name: t('common:general.test'),
    networkByBlockchain: Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName).reduce(
      (accumulator, service) => {
        accumulator[service.name] =
          service.availableNetworks.find(({ type }) => type === 'testnet') || service.defaultNetwork

        return accumulator
      },
      {} as TSelectedNetworks
    ),
  }

  const settingsMigrations = getSettingsMigrations(defaultProfile, testProfile)

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
        bitcoin: [],
        ethereum: [],
        neo3: [],
        neoLegacy: [],
        neox: [],
        polygon: [],
        base: [],
        arbitrum: [],
        solana: [],
      },
      networkProfiles: [defaultProfile, testProfile],
      selectedNetworkProfile: defaultProfile,
      canShowVoteNeo3SupportUsModal: true,
      selectedWallet: undefined,
      selectedAccount: undefined,
      showSideBar: true,
    },
  }

  const settingsReducerConfig: PersistConfig<ISettingsReducer> = {
    key: 'settingsReducer',
    storage,
    version: 14,
    migrate: createMigrate(settingsMigrations),
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
