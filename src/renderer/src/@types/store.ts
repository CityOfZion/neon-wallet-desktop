import { RootStore } from '@renderer/store/RootStore'

import { TBlockchainServiceKey, TNetwork } from './blockchain'

export interface IAccountState {
  address: string
  type: TWalletType
  idWallet: string
  name: string
  backgroundColor: string
  blockchain: TBlockchainServiceKey
  encryptedKey?: string
  order: number
}

export type TWalletType = 'standard' | 'watch' | 'legacy' | 'ledger'
export interface IWalletState {
  id: string
  name: string
  walletType: TWalletType
  encryptedMnemonic?: string
}
export type TSecurityType = 'none' | 'password'

export type TAvailableCurrency = 'USD' | 'BRL' | 'EUR' | 'GBP' | 'CNY'
export type TCurrency = {
  symbol: string
  label: TAvailableCurrency
}
export type TCustomNetwork = Record<TBlockchainServiceKey, TNetwork[]>
export type TSelectedNetworks = Record<TBlockchainServiceKey, TNetwork>
export type TNetworkProfile = {
  id: string
  name: string
  networkByBlockchain: TSelectedNetworks
}
export interface ISettingsState {
  encryptedPassword?: string
  isFirstTime: boolean
  securityType: TSecurityType
  currency: TCurrency
  hasOverTheAirUpdates: boolean
  customNetworks: TCustomNetwork
  selectedNetworkByBlockchain: TSelectedNetworks
  networkProfiles: TNetworkProfile[]
  selectedNetworkProfile: TNetworkProfile
}

export type TContactAddress = { address: string; blockchain: TBlockchainServiceKey }
export interface IContactState {
  id: string
  name: string
  addresses: TContactAddress[]
}

export type RootState = ReturnType<typeof RootStore.reducers>
export type AppDispatch = typeof RootStore.store.dispatch
