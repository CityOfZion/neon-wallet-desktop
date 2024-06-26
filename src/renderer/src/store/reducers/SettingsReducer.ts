import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TBlockchainServiceKey, TNetwork } from '@renderer/@types/blockchain'
import { ISettingsState, TCurrency, TNetworkProfile, TSecurityType } from '@renderer/@types/store'
import { availableCurrencies } from '@renderer/constants/currency'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { cloneDeep } from 'lodash'

export const settingsReducerName = 'settingsReducer'

const initialState: ISettingsState = {
  encryptedPassword: undefined,
  securityType: 'none',
  isFirstTime: true,
  currency: availableCurrencies[0],
  hasOverTheAirUpdates: false,
  customNetworks: {
    ethereum: [],
    neo3: [],
    neoLegacy: [],
  },
  selectedNetworkByBlockchain: DEFAULT_NETWORK_BY__BLOCKCHAIN,
  networkProfiles: [DEFAULT_NETWORK_PROFILE],
  selectedNetworkProfile: DEFAULT_NETWORK_PROFILE,
  unlockedSkins: [],
}

const setEncryptedPassword: CaseReducer<ISettingsState, PayloadAction<string | undefined>> = (state, action) => {
  state.encryptedPassword = action.payload
}

const setIsFirstTime: CaseReducer<ISettingsState, PayloadAction<boolean>> = (state, action) => {
  state.isFirstTime = action.payload
}

const setSecurityType: CaseReducer<ISettingsState, PayloadAction<TSecurityType>> = (state, action) => {
  state.securityType = action.payload
}

const setCurrency: CaseReducer<ISettingsState, PayloadAction<TCurrency>> = (state, action) => {
  state.currency = action.payload
}

const setHasOverTheAirUpdates: CaseReducer<ISettingsState, PayloadAction<boolean>> = (state, action) => {
  state.hasOverTheAirUpdates = action.payload
}

const setSelectNetwork: CaseReducer<
  ISettingsState,
  PayloadAction<{ blockchain: TBlockchainServiceKey; network: TNetwork }>
> = (state, action) => {
  const { blockchain, network } = action.payload

  const cloneSelectedNetworkByBlockchain = cloneDeep(state.selectedNetworkByBlockchain)
  cloneSelectedNetworkByBlockchain[blockchain] = network

  state.selectedNetworkByBlockchain = cloneSelectedNetworkByBlockchain
}

const setSelectedNetworkUrl: CaseReducer<
  ISettingsState,
  PayloadAction<{ blockchain: TBlockchainServiceKey; url: string }>
> = (state, action) => {
  const { blockchain, url } = action.payload

  const cloneSelectedNetworkByBlockchain = cloneDeep(state.selectedNetworkByBlockchain)
  cloneSelectedNetworkByBlockchain[blockchain].url = url

  state.selectedNetworkByBlockchain = cloneSelectedNetworkByBlockchain
}

const saveCustomNetwork: CaseReducer<
  ISettingsState,
  PayloadAction<{
    blockchain: TBlockchainServiceKey
    network: TNetwork
  }>
> = (state, action) => {
  const { blockchain, network } = action.payload
  const cloneNetworks = cloneDeep(state.customNetworks)

  const findIndex = cloneNetworks[blockchain].findIndex(it => it.id === network.id)
  if (findIndex < 0) {
    cloneNetworks[blockchain].push(network)
  }

  cloneNetworks[blockchain][findIndex] = network

  state.customNetworks = cloneNetworks
}

const deleteCustomNetwork: CaseReducer<
  ISettingsState,
  PayloadAction<{
    blockchain: TBlockchainServiceKey
    network: TNetwork
  }>
> = (state, action) => {
  const { network, blockchain } = action.payload

  const cloneNetworks = cloneDeep(state.customNetworks)
  const cloneSelectedNetwork = cloneDeep(state.selectedNetworkByBlockchain)

  const filteredNetworks = cloneNetworks[blockchain].filter(network => network.id !== network.id)
  cloneNetworks[blockchain] = filteredNetworks
  state.customNetworks = cloneNetworks

  if (cloneSelectedNetwork[blockchain].id === network.id) {
    cloneSelectedNetwork[blockchain] = DEFAULT_NETWORK_BY__BLOCKCHAIN[blockchain]
    state.selectedNetworkByBlockchain = cloneSelectedNetwork
  }
}

const saveNetworkProfile: CaseReducer<ISettingsState, PayloadAction<TNetworkProfile>> = (state, action) => {
  const profile = action.payload

  const findIndex = state.networkProfiles.findIndex(it => it.id === profile.id)
  if (findIndex < 0) {
    state.networkProfiles = [...state.networkProfiles, profile]
  }

  state.networkProfiles[findIndex] = profile

  if (state.selectedNetworkProfile.id === profile.id) {
    state.selectedNetworkProfile = profile
    state.selectedNetworkByBlockchain = profile.networkByBlockchain
  }
}

const deleteNetworkProfile: CaseReducer<ISettingsState, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload
  state.networkProfiles = state.networkProfiles.filter(profile => profile.id !== profileId)

  if (state.selectedNetworkProfile.id === profileId) {
    state.selectedNetworkProfile = DEFAULT_NETWORK_PROFILE
  }
}

const setSelectNetworkProfile: CaseReducer<ISettingsState, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload

  const profile = state.networkProfiles.find(it => it.id === profileId)
  if (!profile) return

  state.selectedNetworkProfile = profile
  state.selectedNetworkByBlockchain = profile.networkByBlockchain
}

const unlockSkin: CaseReducer<ISettingsState, PayloadAction<string>> = (state, action) => {
  const skinId = action.payload
  state.unlockedSkins = [...state.unlockedSkins, skinId]
}

const SettingsReducer = createSlice({
  name: settingsReducerName,
  initialState,
  reducers: {
    setIsFirstTime,
    setSecurityType,
    setEncryptedPassword,
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
  },
})

export const settingsReducerActions = {
  ...SettingsReducer.actions,
}

export default SettingsReducer.reducer
