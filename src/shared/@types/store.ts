import { TBlockchainServiceKey, TNetwork } from './blockchain'

export type TAccountType = 'standard' | 'watch' | 'ledger'
export type TWalletType = 'standard' | 'ledger'

export type TSelectedNftSkin = {
  type: 'nft'
  imgUrl: string
  contractHash: string
}
export type TSelectedLocalSkin = {
  type: 'local'
  id: string
}

export type TSelectedSkin = TSelectedLocalSkin | TSelectedNftSkin
export interface IAccountState {
  address: string
  type: TAccountType
  idWallet: string
  name: string
  backgroundColor: string
  blockchain: TBlockchainServiceKey
  encryptedKey?: string
  order: number
  selectedSkin?: TSelectedSkin
}
export interface IWalletState {
  id: string
  name: string
  type: TWalletType
  encryptedMnemonic?: string
  selectedSkin?: TSelectedSkin
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
  unlockedSkinIds: string[]
}

export type TContactAddress = { address: string; blockchain: TBlockchainServiceKey }
export interface IContactState {
  id: string
  name: string
  addresses: TContactAddress[]
}
