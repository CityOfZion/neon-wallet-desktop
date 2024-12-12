import { Account } from '@cityofzion/blockchain-service'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { OpenDialogOptions } from 'electron'

import { TBlockchainServiceKey } from './blockchain'
import {
  TAddHardwareWalletAccountParams,
  TDecryptBasedEncryptedSecretParams,
  TDecryptBasedSecretParams,
  TEncryptBasedEncryptedSecretParams,
  TEncryptBasedSecretParams,
  TGetStoreFromWCSession,
  THardwareWalletInfo,
  TIpcMainAsyncListener,
  TIpcMainSyncListener,
} from './ipc'

export type TMainApiListenersSync = {
  restore: TIpcMainSyncListener<undefined, void>
  sendStoreFromWC: TIpcMainSyncListener<TGetStoreFromWCSession>
  encryptBasedEncryptedSecretSync: TIpcMainSyncListener<TEncryptBasedEncryptedSecretParams, string>
  decryptBasedEncryptedSecretSync: TIpcMainSyncListener<TEncryptBasedEncryptedSecretParams, string>
  encryptBasedOSSync: TIpcMainSyncListener<string, string>
  decryptBasedOSSync: TIpcMainSyncListener<string, string>
}

export type TMainApiListenersAsync = {
  openDialog: TIpcMainAsyncListener<OpenDialogOptions, string[]>
  readFile: TIpcMainAsyncListener<string, string>
  saveFile: TIpcMainAsyncListener<{ path: string; content: string }, void>
  setTitleBarOverlay: TIpcMainAsyncListener<Electron.TitleBarOverlay, void>
  setWindowButtonPosition: TIpcMainAsyncListener<Electron.Point, void>
  connectHardwareWallet: TIpcMainAsyncListener<undefined, THardwareWalletInfo[]>
  disconnectHardwareWallet: TIpcMainAsyncListener<undefined, void>
  addNewHardwareAccount: TIpcMainAsyncListener<TAddHardwareWalletAccountParams, Account<TBlockchainServiceKey>>
  checkForUpdates: TIpcMainAsyncListener<undefined, boolean>
  quitAndInstall: TIpcMainAsyncListener<undefined, void>
  encryptBasedOS: TIpcMainAsyncListener<string, string>
  decryptBasedOS: TIpcMainAsyncListener<string, string>
  encryptBasedSecret: TIpcMainAsyncListener<TEncryptBasedSecretParams, string>
  decryptBasedSecret: TIpcMainAsyncListener<TDecryptBasedSecretParams, string>
  encryptBasedEncryptedSecret: TIpcMainAsyncListener<TEncryptBasedEncryptedSecretParams, string>
  decryptBasedEncryptedSecret: TIpcMainAsyncListener<TDecryptBasedEncryptedSecretParams, string>
  getInitialDeepLinkUri: TIpcMainAsyncListener<undefined, string | undefined>
  resetInitialDeeplink: TIpcMainAsyncListener<undefined, void>
}

export type TMainApiSend = {
  getStoreFromWC: TSession
  hardwareWalletDisconnected: THardwareWalletInfo
  updateCompleted: undefined
  deeplink: string
  getHardwareWalletSignatureStart: undefined
  getHardwareWalletSignatureEnd: undefined
}
