import { TBlockchainServiceKey, TNetwork } from './blockchain'

export type TAccountType = 'standard' | 'watch' | 'ledger'
export type TWalletType = 'standard' | 'ledger'

export type TNftSkin = {
  id: string
  type: 'nft'
  imgUrl: string
}
export type TColorOrLocalSkin = {
  id: string
  type: 'local' | 'color'
}

export type TSkin = TColorOrLocalSkin | TNftSkin
export interface IAccountState {
  id: string
  address: string
  type: TAccountType
  idWallet: string
  name: string
  blockchain: TBlockchainServiceKey
  encryptedKey?: string
  order: number
  skin: TSkin
  lastNftSkin?: TNftSkin
}
export interface IWalletState {
  id: string
  name: string
  type: TWalletType
  encryptedMnemonic?: string
}

export type TSecurityType = 'none' | 'password'

export type TAvailableCurrency = 'USD' | 'BRL' | 'EUR' | 'GBP' | 'CNY'
export type TCurrency = {
  symbol: string
  label: TAvailableCurrency
}
export type TCustomNetwork = {
  [K in TBlockchainServiceKey]: TNetwork<K>[]
}

export type TSelectedNetworks = {
  [K in TBlockchainServiceKey]: TNetwork<K>
}

export type TNetworkProfile = {
  id: string
  name: string
  networkByBlockchain: TSelectedNetworks
}
export interface ISettingsState {
  encryptedPassword?: string
  isFirstTime: boolean
  hasLogin: boolean
  securityType: TSecurityType
  currency: TCurrency
  hasOverTheAirUpdates: boolean
  customNetworks: TCustomNetwork
  selectedNetworkByBlockchain: TSelectedNetworks
  networkProfiles: TNetworkProfile[]
  selectedNetworkProfile: TNetworkProfile
  unlockedSkinIds: string[]
  encryptedLoginControl?: string
}

export type TContactAddress = { address: string; blockchain: TBlockchainServiceKey }
export interface IContactState {
  id: string
  name: string
  addresses: TContactAddress[]
}
