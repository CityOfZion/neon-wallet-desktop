import { TBSAccount } from '@cityofzion/blockchain-service'
import {
  type BrowserWindow,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  type IpcRendererEvent,
  OpenDialogOptions,
} from 'electron'

import { TBlockchainServiceKey } from './blockchain'
import type { TLastIndexesByWallet } from './store'

export type TIpcMainBaseOptions<T = any[]> = {
  args: T
  window: BrowserWindow
  removeAllListeners: () => void
}

export type TIpcMainSyncOptions<T = any[]> = TIpcMainBaseOptions<T> & {
  event: IpcMainEvent
}

export type TIpcMainAsyncOptions<T = any[]> = TIpcMainBaseOptions<T> & {
  event: IpcMainInvokeEvent
}

export type TIpcMainSyncListener<T = any[], R = any> = (options: TIpcMainSyncOptions<T>) => R

export type TIpcMainAsyncListener<T = any[], R = any> = (options: TIpcMainAsyncOptions<T>) => Promise<R> | R

export type TIpcRendererListener<T = any[], R = any> = (options: { event: IpcRendererEvent; args: T }) => R

export type TIpcRendererSendArgs<T> =
  T extends TIpcMainAsyncListener<infer U> ? U : T extends TIpcMainSyncListener<infer A> ? A : never

export type TIpcRendererSendResponse<T> =
  T extends TIpcMainAsyncListener<any, infer U> ? U : T extends TIpcMainSyncListener<any, infer A> ? A : never

export type TAddHardwareWalletAccountParams = {
  index: number
  blockchain: TBlockchainServiceKey
}

export type TConnectHardwareWalletParams = {
  lastIndexesByWallet: TLastIndexesByWallet
}

export type TGetAccountHardwareWalletGenericParams = {
  index: number
  blockchain: TBlockchainServiceKey
}

export type TEncryptBasedSecretParams = {
  value: string
  secret: string
  options?: { algorithm?: 'scrypt' | 'pbkdf2' }
}

export type TDecryptBasedSecretParams = TEncryptBasedSecretParams

export type TEncryptBasedEncryptedSecretParams = Omit<TEncryptBasedSecretParams, 'secret'> & {
  encryptedSecret?: string
}

export type TDecryptBasedEncryptedSecretParams = TEncryptBasedEncryptedSecretParams

export type TSaveFileOptions = { path: string; content: string }

export type TAnalyticsLogEventParams = {
  eventName: string
  clientId: string
  params?: Record<string, any>
}

export type TMainApiListenersSync = {
  'window:restore': TIpcMainSyncListener<undefined, void>
  'encryption:encryptBasedEncryptedSecretSync': TIpcMainSyncListener<TEncryptBasedEncryptedSecretParams, string>
  'encryption:decryptBasedEncryptedSecretSync': TIpcMainSyncListener<TDecryptBasedEncryptedSecretParams, string>
  'encryption:encryptBasedOSSync': TIpcMainSyncListener<string, string>
  'encryption:decryptBasedOSSync': TIpcMainSyncListener<string, string>
  'encryption:generateRandomHexSync': TIpcMainSyncListener<number | undefined, string>
  'window:getVersion': TIpcMainSyncListener<undefined, string>
}

export type TMainApiListenersAsync = {
  'window:openDialog': TIpcMainAsyncListener<OpenDialogOptions, string[]>
  'window:readFile': TIpcMainAsyncListener<string, string>
  'window:saveFile': TIpcMainAsyncListener<TSaveFileOptions, void>
  'window:openFile': TIpcMainAsyncListener<string, void>
  'window:setTitleBarOverlay': TIpcMainAsyncListener<Electron.TitleBarOverlay, void>
  'window:setWindowButtonPosition': TIpcMainAsyncListener<Electron.Point, void>
  'updater:checkForUpdates': TIpcMainAsyncListener<undefined, boolean>
  'updater:quitAndInstall': TIpcMainAsyncListener<undefined, void>
  'encryption:encryptBasedOS': TIpcMainAsyncListener<string, string>
  'encryption:decryptBasedOS': TIpcMainAsyncListener<string, string>
  'encryption:encryptBasedSecret': TIpcMainAsyncListener<TEncryptBasedSecretParams, string>
  'encryption:decryptBasedSecret': TIpcMainAsyncListener<TDecryptBasedSecretParams, string>
  'encryption:encryptBasedEncryptedSecret': TIpcMainAsyncListener<TEncryptBasedEncryptedSecretParams, string>
  'encryption:decryptBasedEncryptedSecret': TIpcMainAsyncListener<TDecryptBasedEncryptedSecretParams, string>
  'deeplink:getInitialUri': TIpcMainAsyncListener<undefined, string | undefined>
  'deeplink:resetInitialUri': TIpcMainAsyncListener<undefined, void>
  'analytics:logEvent': TIpcMainAsyncListener<TAnalyticsLogEventParams, void>

  // Hardware wallet
  'hardwareWallet:disconnect': TIpcMainAsyncListener<undefined, void>
  'hardwareWallet:getAccount': TIpcMainAsyncListener<
    TGetAccountHardwareWalletGenericParams,
    TBSAccount<TBlockchainServiceKey>
  >
  'hardwareWallet:connectByUsb': TIpcMainAsyncListener<
    TConnectHardwareWalletParams,
    TBSAccount<TBlockchainServiceKey>[]
  >
}

export type TMainApiSend = {
  'updater:updateCompleted': undefined
  'updater:updateError': string
  'deeplink:connection': string

  // Hardware wallet
  'hardwareWallet:onDisconnect': undefined
  'hardwareWallet:onSignatureStart': undefined
  'hardwareWallet:onSignatureEnd': undefined
}
