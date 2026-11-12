import type { TBSServiceName } from '@cityofzion/bs-multichain'

import { TNetwork } from './blockchain'
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

export type TAccount<N extends TBSServiceName = TBSServiceName> = N extends TBSServiceName
  ? {
      id: string
      address: string
      type: TAccountType
      idWallet: string
      name: string
      blockchain: N
      encryptedKey?: string
      order: number
      skin: TSkin
    }
  : never

export type TWallet = {
  id: string
  name: string
  type: TWalletType
  encryptedMnemonic?: string
  accounts: TAccount[]
  backupStatus: TWalletBackupStatus
}

export type TAccountWithWallet = TAccount & {
  wallet: TWallet
}

export type TLoginSessionType = 'password' | 'hardware' | 'key'

export type TLoginSession = {
  type: TLoginSessionType
  encryptedPassword: string
}

export type TAvailableLanguages = 'English' | 'Deutsch' | 'Português (BR)' | '简体中文' | '繁體中文'

export type TLanguage = {
  value: string
  label: TAvailableLanguages
}

export type TAvailableCurrency = 'USD' | 'BRL' | 'EUR' | 'GBP' | 'CNY'

export type TCurrency = {
  symbol: string
  label: TAvailableCurrency
}
export type TCustomNetworks = {
  [K in TBSServiceName]: TNetwork[]
}

export type TSelectedNetworks = {
  [K in TBSServiceName]: TNetwork
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

export type TContactAddress = {
  address: string
  blockchain: TBSServiceName
}

export type TContactEncryptedAddress = {
  encryptedAddress: string
  blockchain: TBSServiceName
}

export type TContact<A = TContactAddress> = {
  id: string
  name: string
  addresses: A[]
}

export type TLastIndexesByWallet = Partial<Record<TBSServiceName, Record<string, number>>>

export type TNotificationNavigateActionHideFraudulentTokenPayload = {
  to: 'hide-fraudulent-token'
  address: string
  blockchain: TBSServiceName
  tokenHash?: string
}

export type TNotificationNavigateActionBNeoShutdownPayload = {
  to: 'bneo-shutdown'
  address: string
  blockchain: TBSServiceName
}

export type TNotificationNavigateAction = {
  type: 'navigate'
  payload:
    | { to: 'account'; address: string; blockchain: TBSServiceName }
    | { to: 'account-transaction'; address: string; blockchain: TBSServiceName }
    | { to: 'account-tokens'; address: string; blockchain: TBSServiceName }
    | TNotificationNavigateActionHideFraudulentTokenPayload
    | { to: 'neo3-vote'; address: string; blockchain: TBSServiceName }
    | { to: 'backup-wallet' }
    | TNotificationNavigateActionBNeoShutdownPayload
}

export type TNotificationAction = TNotificationNavigateAction

export type TNotificationPriority = 'low' | 'medium' | 'high'

export type TNotification = {
  id: string
  title: string
  titleValue?: string
  previewBody: string
  previewBodyValue?: string
  date: string
  body?: string
  read: boolean
  priority: TNotificationPriority
  provider: 'system'
  action?: TNotificationAction
  related?: {
    blockchain: TBSServiceName
    address?: string
  }
}

export type TSaveNotification = Optional<TNotification, 'id' | 'date' | 'provider' | 'read' | 'priority'>

export type THiddenTokenByBlockchain = Partial<Record<TBSServiceName, string[]>>
