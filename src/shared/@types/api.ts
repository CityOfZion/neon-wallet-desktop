import { Account } from '@cityofzion/blockchain-service'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { OpenDialogOptions } from 'electron'

import { TBlockchainServiceKey } from './blockchain'
import {
  TAddAccountHardwareWalletGenericParams,
  TConnectHardwareWalletByUsbParams,
  TDecryptBasedEncryptedSecretParams,
  TDecryptBasedSecretParams,
  TEncryptBasedEncryptedSecretParams,
  TEncryptBasedSecretParams,
  TGetStoreFromWCSession,
  TIpcMainAsyncListener,
  TIpcMainSyncListener,
  TIsConnectedAndUnlockedHardwareWalletGenericParams,
} from './ipc'

export type TMainApiListenersSync = {
  restore: TIpcMainSyncListener<undefined, void>
  sendStoreFromWC: TIpcMainSyncListener<TGetStoreFromWCSession>
  encryptBasedEncryptedSecretSync: TIpcMainSyncListener<TEncryptBasedEncryptedSecretParams, string>
  decryptBasedEncryptedSecretSync: TIpcMainSyncListener<TDecryptBasedEncryptedSecretParams, string>
  encryptBasedOSSync: TIpcMainSyncListener<string, string>
  decryptBasedOSSync: TIpcMainSyncListener<string, string>
  generateRandomHexSync: TIpcMainSyncListener<number | undefined, string>
  getVersion: TIpcMainSyncListener<undefined, string>
}

export type TMainApiListenersAsync = {
  openDialog: TIpcMainAsyncListener<OpenDialogOptions, string[]>
  readFile: TIpcMainAsyncListener<string, string>
  saveFile: TIpcMainAsyncListener<{ path: string; content: string }, void>
  setTitleBarOverlay: TIpcMainAsyncListener<Electron.TitleBarOverlay, void>
  setWindowButtonPosition: TIpcMainAsyncListener<Electron.Point, void>
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

  // Hardware wallet
  'hardwareWallet:disconnect': TIpcMainAsyncListener<undefined, void>
  'hardwareWallet:isConnectedAndUnlocked': TIpcMainAsyncListener<
    TIsConnectedAndUnlockedHardwareWalletGenericParams,
    boolean
  >
  'hardwareWallet:addAccount': TIpcMainAsyncListener<
    TAddAccountHardwareWalletGenericParams,
    Account<TBlockchainServiceKey>
  >

  'hardwareWalletByUsb:connect': TIpcMainAsyncListener<
    TConnectHardwareWalletByUsbParams,
    Account<TBlockchainServiceKey>[]
  >
}

export type TMainApiSend = {
  getStoreFromWC: TSession
  updateCompleted: undefined
  updateError: string
  deeplink: string

  // Hardware wallet
  'hardwareWallet:onDisconnect': undefined
  'hardwareWallet:onSignatureStart': undefined
  'hardwareWallet:onSignatureEnd': undefined
}
