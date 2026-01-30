import type { TBSNetwork } from '@cityofzion/blockchain-service'

import { IAccountState, IWalletState, TAccountType, TSkin, TWalletBackupStatus, TWalletType } from './store'

export type TBlockchainServiceKey =
  | 'neo3'
  | 'neoLegacy'
  | 'ethereum'
  | 'neox'
  | 'polygon'
  | 'base'
  | 'arbitrum'
  | 'solana'

export type TBlockchainImageColor = 'default' | 'white' | 'gray' | 'blue' | 'green'

export type TUseImportAccountParams = {
  address: string
  blockchain: TBlockchainServiceKey
  wallet: IWalletState
  type: TAccountType
  key?: string
  name?: string
  order?: number
  skin?: TSkin
}

export type TAccountsToImport = Omit<TUseImportAccountParams, 'wallet'>[]

export type TCreateWalletAndAccountParam = TUseCreateWalletParams & {
  accounts: TAccountsToImport
}

export type TUseImportAccountsParams = {
  wallet: IWalletState
  accounts: TAccountsToImport
}

export type TUseCreateStandardAccountParams = {
  id?: string
  wallet: IWalletState
  name: string
  blockchain: TBlockchainServiceKey
  skin?: TSkin
}

export type TUseCreateWalletParams = {
  name: string
  mnemonic?: string
  id?: string
  type?: TWalletType
  backupStatus?: TWalletBackupStatus
}

export type TNetwork = {
  isAutomatic?: boolean
} & TBSNetwork

export type TUseEditAccountParams = {
  account: IAccountState
  data: Partial<Omit<IAccountState, 'address' | 'encryptedKey' | 'id'>> & { key?: string }
}

export type TUseEditWalletParams = {
  wallet: IWalletState
  data: Partial<Omit<IWalletState, 'id' | 'encryptedMnemonic'>> & { mnemonic?: string }
}
