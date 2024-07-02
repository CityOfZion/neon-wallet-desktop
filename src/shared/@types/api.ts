import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { OpenDialogOptions } from 'electron'

import { TGetStoreFromWCSession, TIpcMainAsyncListener, TIpcMainSyncListener, TLedgerInfo } from './ipc'

export type TMainApiListenersSync = {
  restore: TIpcMainSyncListener<undefined, void>
  sendStoreFromWC: TIpcMainSyncListener<TGetStoreFromWCSession>
  startLedger: TIpcMainSyncListener<undefined, void>
  encryptBasedEncryptedSecretSync: TIpcMainSyncListener<{ value: string; encryptedSecret?: string }, string>
  decryptBasedEncryptedSecretSync: TIpcMainSyncListener<{ value: string; encryptedSecret?: string }, string>
}

export type TMainApiListenersAsync = {
  openDialog: TIpcMainAsyncListener<OpenDialogOptions, string[]>
  readFile: TIpcMainAsyncListener<string, string>
  saveFile: TIpcMainAsyncListener<{ path: string; content: string }, void>
  setTitleBarOverlay: TIpcMainAsyncListener<Electron.TitleBarOverlay, void>
  setWindowButtonPosition: TIpcMainAsyncListener<Electron.Point, void>
  checkForUpdates: TIpcMainAsyncListener<undefined, void>
  quitAndInstall: TIpcMainAsyncListener<undefined, void>
  getConnectedLedgers: TIpcMainAsyncListener<undefined, TLedgerInfo[]>
  encryptBasedOS: TIpcMainAsyncListener<string, string>
  decryptBasedOS: TIpcMainAsyncListener<string, string>
  encryptBasedSecret: TIpcMainAsyncListener<{ value: string; secret: string }, string>
  decryptBasedSecret: TIpcMainAsyncListener<{ value: string; secret: string }, string>
  encryptBasedEncryptedSecret: TIpcMainAsyncListener<{ value: string; encryptedSecret?: string }, string>
  decryptBasedEncryptedSecret: TIpcMainAsyncListener<{ value: string; encryptedSecret?: string }, string>
  getInitialDeepLinkUri: TIpcMainAsyncListener<undefined, string | undefined>
  resetInitialDeeplink: TIpcMainAsyncListener<undefined, void>
}

export type TMainApiSend = {
  getStoreFromWC: TSession
  ledgerConnected: TLedgerInfo
  ledgerDisconnected: string
  updateCompleted: undefined
  deeplink: string
  getLedgerSignatureStart: undefined
  getLedgerSignatureEnd: undefined
}
