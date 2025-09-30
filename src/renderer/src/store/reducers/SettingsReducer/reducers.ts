import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_NETWORK_BY__BLOCKCHAIN, DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TCurrency, TLanguage, TNetworkProfile, TOverTheAirInfo } from '@shared/@types/store'
import { cloneDeep } from 'lodash'

import { ISettingsReducer } from './index'

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

const setLanguage: CaseReducer<ISettingsReducer, PayloadAction<TLanguage>> = (state, action) => {
  state.data.language = action.payload
}

const setOverTheAirInfo: CaseReducer<ISettingsReducer, PayloadAction<Partial<TOverTheAirInfo>>> = (state, action) => {
  state.data.overTheAirInfo = { ...state.data.overTheAirInfo, ...action.payload }
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
  } else {
    cloneNetworks[blockchain][findIndex] = network
  }

  state.data.customNetworks = cloneNetworks

  const profileNetworkByBlockchain = state.data.selectedNetworkProfile.networkByBlockchain

  if (profileNetworkByBlockchain[blockchain].id === network.id) {
    profileNetworkByBlockchain[blockchain] = network
  }
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

  cloneNetworks[blockchain] = cloneNetworks[blockchain].filter(({ id }) => id !== network.id)
  state.data.customNetworks = cloneNetworks

  const selectedNetwork = state.data.selectedNetworkProfile.networkByBlockchain[blockchain]

  if (selectedNetwork.id === network.id) {
    const defaultNetwork = DEFAULT_NETWORK_BY__BLOCKCHAIN[blockchain]
    state.data.selectedNetworkProfile.networkByBlockchain[blockchain] = defaultNetwork
  }
}

const saveNetworkProfile: CaseReducer<ISettingsReducer, PayloadAction<TNetworkProfile>> = (state, action) => {
  const profile = action.payload

  const findIndex = state.data.networkProfiles.findIndex(it => it.id === profile.id)
  if (findIndex < 0) {
    state.data.networkProfiles = [...state.data.networkProfiles, profile]
  } else {
    state.data.networkProfiles[findIndex] = profile
  }

  if (state.data.selectedNetworkProfile.id === profile.id) {
    state.data.selectedNetworkProfile = profile
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
}

const setCanShowVoteNeo3SupportUsModalAgain: CaseReducer<ISettingsReducer, PayloadAction<boolean>> = (
  state,
  action
) => {
  state.data.canShowVoteNeo3SupportUsModal = action.payload
}

export const settingsSliceReducers = {
  setEncryptedLoginControl,
  setIsFirstTime,
  setHasPassword,
  setCurrency,
  setLanguage,
  setOverTheAirInfo,
  saveCustomNetwork,
  deleteCustomNetwork,
  saveNetworkProfile,
  deleteNetworkProfile,
  setSelectNetworkProfile,
  setCanShowVoteNeo3SupportUsModalAgain,
}
