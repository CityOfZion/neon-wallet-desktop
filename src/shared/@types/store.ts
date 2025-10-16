import { TSwapServiceStatusResponse, TSwapToken } from '@cityofzion/blockchain-service'
import {
  CalculateNeo3MigrationAmountsResponse,
  CalculateNeoLegacyMigrationAmountsResponse,
} from '@cityofzion/bs-neo-legacy'

import { TBlockchainServiceKey, TNetwork } from './blockchain'
import { Optional } from './global'

export type TAccountType = 'standard' | 'watch' | 'hardware'
export type TWalletType = 'standard' | 'hardware'
export type TWalletBackupStatus = 'successful' | 'unsuccessful'

export type TNftSkin = {
  id: string
  type: 'nft'
  imgUrl: string
}

export type TColorSkin = {
  id: string
  type: 'color'
}

export type TLocalSkin = {
  id: string
  type: 'local'
}

export type TSkin = TColorSkin | TLocalSkin | TNftSkin

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
}

export interface IWalletState {
  id: string
  name: string
  type: TWalletType
  encryptedMnemonic?: string
  accounts: IAccountState[]
  backupStatus: TWalletBackupStatus
}

export type TAccountWithWallet = IAccountState & {
  wallet: IWalletState
}

export type TLoginSessionType = 'password' | 'hardware' | 'key'

export type TLoginSession = {
  type: TLoginSessionType
  encryptedPassword: string
}

export type TAvailableLanguages = 'English' | '简体中文' | '繁體中文'

export type TLanguage = {
  value: string
  label: TAvailableLanguages
}

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

export type TOverTheAirInfo = {
  lastAppVersion?: string
  hasUpdated?: boolean
  shouldUpdate: boolean
}

export interface ISettingsState {
  isFirstTime: boolean
  hasPassword: boolean
  currency: TCurrency
  language: TLanguage
  overTheAirInfo: TOverTheAirInfo
  customNetworks: TCustomNetwork
  networkProfiles: TNetworkProfile[]
  selectedNetworkProfile: TNetworkProfile
  canShowVoteNeo3SupportUsModal: boolean
  encryptedLoginControl?: string
}

export type TContactAddress = {
  address: string
  blockchain: TBlockchainServiceKey
}

export type TContactEncryptedAddress = {
  encryptedAddress: string
  blockchain: TBlockchainServiceKey
}

export interface IContactState<A = TContactAddress> {
  id: string
  name: string
  addresses: A[]
}

export type TSwapRecord = {
  account: IAccountState
  txFrom?: string
  txTo?: string
  swapProvider: 'simpleswap'
  swapId?: string
  swapStatus: TSwapServiceStatusResponse['status']
  tokenFrom: TSwapToken<TBlockchainServiceKey>
  tokenTo: TSwapToken<TBlockchainServiceKey>
  amountFrom: string
  amountTo: string
  addressTo: string
  extraIdTo?: string
  fee?: string
  log?: string
}

export type TLastIndexesByWallet = Partial<Record<TBlockchainServiceKey, Record<string, number>>>

export type TNotificationNavigateActionHideFraudulentTokenPayload = {
  to: 'hide-fraudulent-token'
  address: string
  blockchain: TBlockchainServiceKey
  tokenHash?: string
}

export type TNotificationNavigateAction = {
  type: 'navigate'
  payload:
    | {
        to: 'account'
        address: string
        blockchain: TBlockchainServiceKey
      }
    | {
        to: 'account-transaction'
        address: string
        blockchain: TBlockchainServiceKey
      }
    | {
        to: 'account-tokens'
        address: string
        blockchain: TBlockchainServiceKey
      }
    | TNotificationNavigateActionHideFraudulentTokenPayload
    | {
        to: 'migration-neo3'
        address: string
        blockchain: TBlockchainServiceKey
      }
    | {
        to: 'vote-neo3'
        address: string
        blockchain: TBlockchainServiceKey
      }
    | {
        to: 'backup-wallet'
      }
}

export type TNotificationAction = TNotificationNavigateAction

export type TNotificationPriority = 'low' | 'medium' | 'high'

export type TNotification = {
  id: string
  title: string
  titleValue?: string
  previewBody: string
  previewBodyValue?: string
  date: number
  body?: string
  read: boolean
  priority: TNotificationPriority
  provider: 'system'
  action?: TNotificationAction
  related?: {
    blockchain: TBlockchainServiceKey
    address?: string
  }
}

export type TSaveNotification = Optional<TNotification, 'id' | 'date' | 'provider' | 'read' | 'priority'>

export type TMigrationNeo3Status = 'done' | 'pending' | 'failure' | 'failure-neo3'

export type TMigrationNeo3 = {
  hash: string
  neoLegacyAccount: IAccountState
  neo3Address: string
  status: TMigrationNeo3Status
  neo3MigrationAmounts: CalculateNeo3MigrationAmountsResponse
  neoLegacyMigrationAmounts: CalculateNeoLegacyMigrationAmountsResponse
  time: number
}

export type TMigrationsNeo3 = {
  [hash: string]: TMigrationNeo3
}

export type THiddenTokenByBlockchain = Partial<Record<TBlockchainServiceKey, string[]>>
