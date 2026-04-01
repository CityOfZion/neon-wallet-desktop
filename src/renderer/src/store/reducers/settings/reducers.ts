import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey, TNetwork } from '@shared/types/blockchain'
import type { DeepPartial } from '@shared/types/global'
import { TAccount, TCurrency, TLanguage, TNetworkProfile, TOverTheAirInfo, TWallet } from '@shared/types/store'

import { TSettingsReducer } from './index'

const setEncryptedLoginControl: CaseReducer<TSettingsReducer, PayloadAction<string | undefined>> = (state, action) => {
  state.data.encryptedLoginControl = action.payload
}

const setIsFirstTime: CaseReducer<TSettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.data.isFirstTime = action.payload
}

const setHasPassword: CaseReducer<TSettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.data.hasPassword = action.payload
}

const setCurrency: CaseReducer<TSettingsReducer, PayloadAction<TCurrency>> = (state, action) => {
  state.data.currency = action.payload
}

const setLanguage: CaseReducer<TSettingsReducer, PayloadAction<TLanguage>> = (state, action) => {
  state.data.language = action.payload
}

const setOverTheAirInfo: CaseReducer<TSettingsReducer, PayloadAction<Partial<TOverTheAirInfo>>> = (state, action) => {
  state.data.overTheAirInfo = { ...state.data.overTheAirInfo, ...action.payload }
}

const setSelectedWallet: CaseReducer<TSettingsReducer, PayloadAction<TWallet | undefined>> = (state, action) => {
  state.data.selectedWallet = action.payload
}

const setSelectedAccount: CaseReducer<TSettingsReducer, PayloadAction<TAccount | undefined>> = (state, action) => {
  state.data.selectedAccount = action.payload
}

const saveCustomNetwork: CaseReducer<
  TSettingsReducer,
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

  const selectedProfile = cloneDeep(state.data.selectedNetworkProfile)

  if (selectedProfile.networkByBlockchain[blockchain].id === network.id) {
    selectedProfile.networkByBlockchain[blockchain] = network
  }

  state.data.selectedNetworkProfile = selectedProfile

  const profileIndex = state.data.networkProfiles.findIndex(it => it.id === selectedProfile.id)
  state.data.networkProfiles[profileIndex] = selectedProfile
}

const deleteCustomNetwork: CaseReducer<
  TSettingsReducer,
  PayloadAction<{ blockchain: TBlockchainServiceKey; network: TNetwork }>
> = (state, action) => {
  const { network, blockchain } = action.payload

  const cloneNetworks = cloneDeep(state.data.customNetworks)

  cloneNetworks[blockchain] = cloneNetworks[blockchain].filter(({ id }) => id !== network.id)
  state.data.customNetworks = cloneNetworks

  const selectedProfile = cloneDeep(state.data.selectedNetworkProfile)

  if (selectedProfile.networkByBlockchain[blockchain].id === network.id) {
    selectedProfile.networkByBlockchain[blockchain] =
      BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain].defaultNetwork
  }

  state.data.selectedNetworkProfile = selectedProfile

  const profileIndex = state.data.networkProfiles.findIndex(it => it.id === selectedProfile.id)
  state.data.networkProfiles[profileIndex] = selectedProfile
}

const saveNetworkProfile: CaseReducer<TSettingsReducer, PayloadAction<TNetworkProfile>> = (state, action) => {
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
  TSettingsReducer,
  PayloadAction<DeepPartial<TNetworkProfile> & { id: string }>
> = (state, action) => {
  const profile = cloneDeep(action.payload)

  const findIndex = state.data.networkProfiles.findIndex(it => it.id === profile.id)
  if (findIndex < 0) return

  const currentProfile = cloneDeep(state.data.networkProfiles[findIndex])
  merge(currentProfile, profile)

  state.data.networkProfiles[findIndex] = currentProfile

  if (state.data.selectedNetworkProfile.id === profile.id) {
    state.data.selectedNetworkProfile = currentProfile
  }
}

const deleteNetworkProfile: CaseReducer<TSettingsReducer, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload
  state.data.networkProfiles = state.data.networkProfiles.filter(profile => profile.id !== profileId)

  if (state.data.selectedNetworkProfile.id === profileId) {
    state.data.selectedNetworkProfile = state.data.networkProfiles[0]
  }
}

const setSelectNetworkProfile: CaseReducer<TSettingsReducer, PayloadAction<string>> = (state, action) => {
  const profileId = action.payload

  const profile = state.data.networkProfiles.find(it => it.id === profileId)
  if (!profile) return

  state.data.selectedNetworkProfile = profile
}

const setCanShowNeo3VoteSupportUsModalAgain: CaseReducer<TSettingsReducer, PayloadAction<boolean>> = (
  state,
  action
) => {
  state.data.canShowNeo3VoteSupportUsModal = action.payload
}

const setShowSideBar: CaseReducer<TSettingsReducer, PayloadAction<boolean>> = (state, action) => {
  state.memoryData.showSideBar = action.payload
}

export const settingsSliceReducers = {
  setEncryptedLoginControl,
  setHasPassword,
  setIsFirstTime,
  setLanguage,
  setCurrency,
  setSelectedWallet,
  setSelectedAccount,
  setOverTheAirInfo,
  saveCustomNetwork,
  deleteCustomNetwork,
  saveNetworkProfile,
  editNetworkProfile,
  deleteNetworkProfile,
  setSelectNetworkProfile,
  setCanShowNeo3VoteSupportUsModalAgain,
  setShowSideBar,
}
