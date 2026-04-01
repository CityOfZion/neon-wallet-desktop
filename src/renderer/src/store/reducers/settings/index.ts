import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { LanguageHelper } from '@renderer/helpers/LanguageHelper'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type {
  TAccount,
  TCurrency,
  TCustomNetworks,
  TLanguage,
  TNetworkProfile,
  TOverTheAirInfo,
  TSelectedNetworks,
  TWallet,
} from '@shared/types/store'

import { getSettingsMigrations } from './migrations'
import { settingsSliceReducers } from './reducers'

export type TSettingsReducer = {
  memoryData: {
    showSideBar: boolean
  }
  data: {
    isFirstTime: boolean
    hasPassword: boolean
    currency: TCurrency
    language: TLanguage
    overTheAirInfo: TOverTheAirInfo
    customNetworks: TCustomNetworks
    networkProfiles: TNetworkProfile[]
    selectedNetworkProfile: TNetworkProfile
    canShowNeo3VoteSupportUsModal: boolean
    encryptedLoginControl?: string
    selectedWallet?: TWallet
    selectedAccount?: TAccount
  }
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
      stellar: BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar.defaultNetwork,
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

  const settingsReducerInitialState: TSettingsReducer = {
    memoryData: {
      showSideBar: true,
    },
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
        stellar: [],
      },
      networkProfiles: [defaultProfile, testProfile],
      selectedNetworkProfile: defaultProfile,
      canShowNeo3VoteSupportUsModal: true,
      selectedWallet: undefined,
      selectedAccount: undefined,
    },
  }

  const settingsReducerConfig: PersistConfig<TSettingsReducer> = {
    key: 'settingsReducer',
    storage,
    version: 15,
    migrate: createMigrate(settingsMigrations),
    blacklist: ['memoryData'],
  }

  const settingsSlice = createSlice({
    name: settingsReducerConfig.key,
    initialState: settingsReducerInitialState,
    reducers: settingsSliceReducers,
  })

  settingsReducerActions = settingsSlice.actions

  return persistReducer(settingsReducerConfig, settingsSlice.reducer)
}
