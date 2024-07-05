import { NetworkType } from '@cityofzion/blockchain-service'

import { IAccountState, IContactState, IWalletState, TAccountType, TSkin, TWalletType } from './store'

export type TBlockchainServiceKey = 'neo3' | 'neoLegacy' | 'ethereum'
export type TBlockchainImageColor = 'white' | 'gray' | 'blue' | 'green'

export type TAccountToImport = {
  address: string
  blockchain: TBlockchainServiceKey
  wallet: IWalletState
  type: TAccountType
  key?: string
  name?: string
  order?: number
  skin?: TSkin
}

export type TAccountsToImport = Omit<TAccountToImport, 'wallet'>[]

export type TImportAccountsParam = {
  wallet: IWalletState
  accounts: TAccountsToImport
}

export type TAccountToCreate = {
  wallet: IWalletState
  name: string
  blockchain: TBlockchainServiceKey
  skin?: TSkin
}

export type TWalletToCreate = {
  name: string
  mnemonic?: string
  id?: string
  type?: TWalletType
}

export type TNetworkType = NetworkType
export type TNetwork = {
  id: string
  name: string
  type: TNetworkType
  url: string
}

export type TAccountBackupFormat = {
  address: string
  type: TAccountType
  idWallet: string
  name: string
  skin: TSkin
  lastNftSkin?: TSkin
  blockchain: TBlockchainServiceKey
  key?: string
  order: number
}

export type TWalletBackupFormat = {
  id: string
  name: string
  mnemonic?: string
  accounts: TAccountBackupFormat[]
}

export type TBackupFormat = {
  wallets: TWalletBackupFormat[]
  contacts: IContactState[]
}

export type TAccountToEdit = {
  account: IAccountState
  data: Partial<Omit<IAccountState, 'address' | 'encryptedKey'>> & { key?: string }
}
