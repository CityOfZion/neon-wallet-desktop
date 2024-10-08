import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { availableCurrencies } from '@renderer/constants/currency'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { ISettingsState, TCurrency, TNetworkProfile } from '@shared/@types/store'
import { cloneDeep } from 'lodash'
import { createMigrate, PersistConfig, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export interface ISettingsReducer {
  data: ISettingsState
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
}

export const settingsReducerConfig: PersistConfig<ISettingsReducer> = {
  key: 'settingsReducer',
  storage: storage,
  version: 0,
  migrate: createMigrate(settingsReducerMigrations),
}

const initialState: ISettingsReducer = {
  data: {
    hasPassword: false,
    isFirstTime: true,
    currency: availableCurrencies[0],
    hasOverTheAirUpdates: false,
    customNetworks: {
      ethereum: [],
      neo3: [],
      neoLegacy: [],
      neox: [],
    },
    selectedNetworkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
    networkProfiles: [DEFAULT_NETWORK_PROFILE],
    selectedNetworkProfile: DEFAULT_NETWORK_PROFILE,
    unlockedSkinIds: [],
  },
}

const setEncryptedLoginControl: CaseReducer<ISettingsReducer, PayloadAction<string | undefined>> = (state, action) => {
  state.data.encryptedLoginControl = action.payload
}

const setIsFirstTime: CaseReducer<ISettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.data.isFirstTime = action.payload
}

const setHasPassword: CaseReducer<ISettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.data.hasPassword = action.payload
}

const setCurrency: CaseReducer<ISettingsReducer, PayloadAction<TCurrency>> = (state, action) => {
  state.data.currency = action.payload
}

const setHasOverTheAirUpdates: CaseReducer<ISettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.data.hasOverTheAirUpdates = action.payload
}

const setSelectNetwork = <T extends TBlockchainServiceKey>(
  state: ISettingsReducer,
  action: PayloadAction<{ blockchain: T; network: TNetwork<T> }>
) => {
  const { blockchain, network } = action.payload

  const cloneSelectedNetworkByBlockchain = cloneDeep(state.data.selectedNetworkByBlockchain)
  cloneSelectedNetworkByBlockchain[blockchain] = network as any

  state.data.selectedNetworkByBlockchain = cloneSelectedNetworkByBlockchain
}

const setSelectedNetworkUrl: CaseReducer<
  ISettingsReducer,
  PayloadAction<{ blockchain: TBlockchainServiceKey; url: string; isAutomatic?: boolean }>
> = (state, action) => {
  const { blockchain, url, isAutomatic } = action.payload

  const cloneSelectedNetworkByBlockchain = cloneDeep(state.data.selectedNetworkByBlockchain)
  cloneSelectedNetworkByBlockchain[blockchain].url = url
  cloneSelectedNetworkByBlockchain[blockchain].isAutomatic = isAutomatic

  state.data.selectedNetworkByBlockchain = cloneSelectedNetworkByBlockchain
}

const saveCustomNetwork = <T extends TBlockchainServiceKey>(
  state: ISettingsReducer,
  action: PayloadAction<{
    blockchain: T
    network: TNetwork<T>
  }>
) => {
  const { blockchain, network } = action.payload
  const cloneNetworks = cloneDeep(state.data.customNetworks)

  const findIndex = cloneNetworks[blockchain].findIndex(it => it.id === network.id)
  if (findIndex < 0) {
    cloneNetworks[blockchain].push(network)
  }

  cloneNetworks[blockchain][findIndex] = network

  state.data.customNetworks = cloneNetworks
}

const deleteCustomNetwork = <T extends TBlockchainServiceKey>(
  state: ISettingsReducer,
  action: PayloadAction<{
    blockchain: T
    network: TNetwork<T>
  }>
) => {
  const { network, blockchain } = action.payload

  const cloneNetworks = cloneDeep(state.data.customNetworks)
  const cloneSelectedNetwork = cloneDeep(state.data.selectedNetworkByBlockchain)

  const filteredNetworks = cloneNetworks[blockchain].filter(network => network.id !== network.id)
  cloneNetworks[blockchain] = filteredNetworks as any
  state.data.customNetworks = cloneNetworks

  if (cloneSelectedNetwork[blockchain].id === network.id) {
    cloneSelectedNetwork[blockchain] = DEFAULT_NETWORK_BY__BLOCKCHAIN[blockchain]
    state.data.selectedNetworkByBlockchain = cloneSelectedNetwork
  }
}

const saveNetworkProfile: CaseReducer<ISettingsReducer, PayloadAction<TNetworkProfile>> = (state, action) => {
  const profile = action.payload

  const findIndex = state.data.networkProfiles.findIndex(it => it.id === profile.id)
  if (findIndex < 0) {
    state.data.networkProfiles = [...state.data.networkProfiles, profile]
  }

  state.data.networkProfiles[findIndex] = profile

  if (state.data.selectedNetworkProfile.id === profile.id) {
    state.data.selectedNetworkProfile = profile
    state.data.selectedNetworkByBlockchain = profile.networkByBlockchain
  }
}

const deleteNetworkProfile: CaseReducer<ISettingsReducer, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload
  state.data.networkProfiles = state.data.networkProfiles.filter(profile => profile.id !== profileId)

  if (state.data.selectedNetworkProfile.id === profileId) {
    state.data.selectedNetworkProfile = DEFAULT_NETWORK_PROFILE
  }
}

const setSelectNetworkProfile: CaseReducer<ISettingsReducer, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload

  const profile = state.data.networkProfiles.find(it => it.id === profileId)
  if (!profile) return

  state.data.selectedNetworkProfile = profile
  state.data.selectedNetworkByBlockchain = profile.networkByBlockchain
}

const unlockSkin: CaseReducer<ISettingsReducer, PayloadAction<string>> = (state, action) => {
  const skinId = action.payload
  state.data.unlockedSkinIds = [...state.data.unlockedSkinIds, skinId]
}

const SettingsReducer = createSlice({
  name: settingsReducerConfig.key,
  initialState,
  reducers: {
    setHasPassword,
    setIsFirstTime,
    setCurrency,
    setHasOverTheAirUpdates,
    setSelectNetwork,
    setSelectedNetworkUrl,
    saveCustomNetwork,
    deleteCustomNetwork,
    saveNetworkProfile,
    deleteNetworkProfile,
    setSelectNetworkProfile,
    unlockSkin,
    setEncryptedLoginControl,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState)
  },
})

export const settingsReducerActions = {
  ...SettingsReducer.actions,
}

export default SettingsReducer.reducer
