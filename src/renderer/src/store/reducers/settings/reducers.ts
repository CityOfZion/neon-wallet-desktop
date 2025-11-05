import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import type { DeepPartial } from '@shared/@types/global'
import { TCurrency, TLanguage, TNetworkProfile, TOverTheAirInfo } from '@shared/@types/store'

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

const saveCustomNetwork: CaseReducer<
  ISettingsReducer,
  PayloadAction<{ blockchain: TBlockchainServiceKey; network: TNetwork }>
> = (state, action) => {
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

const deleteCustomNetwork: CaseReducer<
  ISettingsReducer,
  PayloadAction<{ blockchain: TBlockchainServiceKey; network: TNetwork }>
> = (state, action) => {
  const { network, blockchain } = action.payload

  const cloneNetworks = cloneDeep(state.data.customNetworks)

  cloneNetworks[blockchain] = cloneNetworks[blockchain].filter(({ id }) => id !== network.id)
  state.data.customNetworks = cloneNetworks

  const selectedNetwork = state.data.selectedNetworkProfile.networkByBlockchain[blockchain]

  if (selectedNetwork.id === network.id) {
    state.data.selectedNetworkProfile.networkByBlockchain[blockchain] =
      bsAggregator.blockchainServicesByName[blockchain].defaultNetwork
  }

  const profile = state.data.networkProfiles.find(it => it.id === state.data.selectedNetworkProfile.id)
  if (profile) {
    profile.networkByBlockchain[blockchain] = bsAggregator.blockchainServicesByName[blockchain].defaultNetwork
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

const editNetworkProfile: CaseReducer<
  ISettingsReducer,
  PayloadAction<DeepPartial<TNetworkProfile> & { id: string }>
> = (state, action) => {
  const profile = action.payload

  const findIndex = state.data.networkProfiles.findIndex(it => it.id === profile.id)
  if (findIndex < 0) return

  const currentProfile = cloneDeep(state.data.networkProfiles[findIndex])
  merge(currentProfile, profile)

  state.data.networkProfiles[findIndex] = currentProfile

  if (state.data.selectedNetworkProfile.id === profile.id) {
    state.data.selectedNetworkProfile = currentProfile
  }
}

const deleteNetworkProfile: CaseReducer<ISettingsReducer, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload
  state.data.networkProfiles = state.data.networkProfiles.filter(profile => profile.id !== profileId)

  if (state.data.selectedNetworkProfile.id === profileId) {
    const defaultProfile = state.data.networkProfiles[0]
    state.data.selectedNetworkProfile = defaultProfile
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
  editNetworkProfile,
  deleteNetworkProfile,
  setSelectNetworkProfile,
  setCanShowVoteNeo3SupportUsModalAgain,
}
