import type { TBSNetwork } from '@cityofzion/blockchain-service'
import type { BSBitcoin } from '@cityofzion/bs-bitcoin'
import type { BSEthereum } from '@cityofzion/bs-ethereum'
import type { BSAggregator, TBSServiceByName } from '@cityofzion/bs-multichain'
import type { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import type { BSNeo3 } from '@cityofzion/bs-neo3'
import type { BSNeoX } from '@cityofzion/bs-neox'
import type { BSSolana } from '@cityofzion/bs-solana'
import type { BSStellar } from '@cityofzion/bs-stellar'

import { TAccount, TAccountType, TSkin, TWallet, TWalletBackupStatus, TWalletType } from './store'

export type TBlockchainService =
  | BSNeo3
  | BSNeoLegacy
  | BSNeoX
  | BSSolana
  | BSEthereum<'ethereum'>
  | BSEthereum<'polygon'>
  | BSEthereum<'base'>
  | BSEthereum<'arbitrum'>
  | BSStellar
  | BSBitcoin

export type TBlockchainServiceKey = TBlockchainService['name']

export type TBSAggregator = BSAggregator<TBlockchainService[], TBSServiceByName<TBlockchainService[]>>

export type TUseImportAccountParams = {
  address: string
  blockchain: TBlockchainServiceKey
  wallet: TWallet
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
  wallet: TWallet
  accounts: TAccountsToImport
}

export type TUseCreateStandardAccountParams = {
  id?: string
  wallet: TWallet
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
  account: TAccount
  data: Partial<Omit<TAccount, 'address' | 'encryptedKey' | 'id'>> & { key?: string }
}

export type TUseEditWalletParams = {
  wallet: TWallet
  data: Partial<Omit<TWallet, 'id' | 'encryptedMnemonic'>> & { mnemonic?: string }
}
