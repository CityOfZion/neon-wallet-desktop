import { Network } from '@cityofzion/blockchain-service'
import { BSEthereumNetworkId } from '@cityofzion/bs-ethereum'
import { BSNeoLegacyNetworkId } from '@cityofzion/bs-neo-legacy'
import { BSNeo3NetworkId } from '@cityofzion/bs-neo3'

import { IAccountState, IContactState, IWalletState, TAccountType, TSkin, TWalletType } from './store'

export type TBlockchainServiceKey = 'neo3' | 'neoLegacy' | 'ethereum' | 'neox'
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
}

type TNetworkIdsByBlockchain = {
  neo3: BSNeo3NetworkId
  neoLegacy: BSNeoLegacyNetworkId
  ethereum: BSEthereumNetworkId
  neox: BSEthereumNetworkId
}

export type TNetworkIds<K extends TBlockchainServiceKey> = TNetworkIdsByBlockchain[K]

export type TNetwork<K extends TBlockchainServiceKey> = {
  isAutomatic?: boolean
} & Network<TNetworkIds<K>>

export type TAccountBackupFormat = Omit<IAccountState, 'encryptedKey'> & {
  key?: string
}

export type TWalletBackupFormat = Omit<IWalletState, 'encryptedMnemonic'> & {
  mnemonic?: string
  accounts: TAccountBackupFormat[]
}

export type TBackupFormat = {
  wallets: TWalletBackupFormat[]
  contacts: IContactState[]
}

export type TAccountToEdit = {
  account: IAccountState
  data: Partial<Omit<IAccountState, 'address' | 'encryptedKey' | 'id'>> & { key?: string }
}

export type TWalletToEdit = {
  wallet: IWalletState
  data: Partial<Omit<IWalletState, 'id' | 'encryptedMnemonic'>> & { mnemonic?: string }
}
