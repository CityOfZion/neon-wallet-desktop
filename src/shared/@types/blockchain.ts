import type { TBSNetwork } from '@cityofzion/blockchain-service'

import { IAccountState, IWalletState, TAccountType, TSkin, TWalletBackupStatus, TWalletType } from './store'

export type TBlockchainServiceKey = 'neo3' | 'neoLegacy' | 'ethereum' | 'neox' | 'polygon' | 'base' | 'arbitrum'
export type TBlockchainImageColor = 'default' | 'white' | 'gray' | 'blue' | 'green'

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

export type TCreateWalletAndAccountParam = TWalletToCreate & {
  accounts: TAccountsToImport
}

export type TImportAccountsParam = {
  wallet: IWalletState
  accounts: TAccountsToImport
}

export type TAccountToCreate = {
  id?: string
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
  backupStatus?: TWalletBackupStatus
}

export type TNetwork = {
  isAutomatic?: boolean
} & TBSNetwork

export type TAccountToEdit = {
  account: IAccountState
  data: Partial<Omit<IAccountState, 'address' | 'encryptedKey' | 'id'>> & { key?: string }
}

export type TWalletToEdit = {
  wallet: IWalletState
  data: Partial<Omit<IWalletState, 'id' | 'encryptedMnemonic'>> & { mnemonic?: string }
}
