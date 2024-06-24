import { electronAPI } from '@electron-toolkit/preload'
import { OpenDialogOptions } from 'electron'

export const customAPI = {
  encryptBasedOS: (value: string): Promise<string> => electronAPI.ipcRenderer.invoke('encryptBasedOS', value),

  decryptBasedOS: (value: string): Promise<string> => electronAPI.ipcRenderer.invoke('decryptBasedOS', value),

  encryptBasedEncryptedSecret: async (value: string, encryptedSecret?: string): Promise<string> =>
    electronAPI.ipcRenderer.invoke('encryptBasedEncryptedSecret', value, encryptedSecret),

  decryptBasedEncryptedSecret: async (value: string, encryptedSecret?: string): Promise<string> =>
    electronAPI.ipcRenderer.invoke('decryptBasedEncryptedSecret', value, encryptedSecret),

  encryptBasedEncryptedSecretSync: (value: string, encryptedSecret?: string): string =>
    electronAPI.ipcRenderer.sendSync('encryptBasedEncryptedSecretSync', value, encryptedSecret),

  decryptBasedEncryptedSecretSync: (value: string, encryptedSecret?: string): string =>
    electronAPI.ipcRenderer.sendSync('decryptBasedEncryptedSecretSync', value, encryptedSecret),

  encryptBasedSecret: (value: string, secret: string): Promise<string> =>
    electronAPI.ipcRenderer.invoke('encryptBasedSecret', value, secret),

  decryptBasedSecret: (value: string, secret: string): Promise<string> =>
    electronAPI.ipcRenderer.invoke('decryptBasedSecret', value, secret),

  openDialog: (options: OpenDialogOptions): Promise<string[]> => electronAPI.ipcRenderer.invoke('openDialog', options),

  readFile: (path: string): Promise<string> => electronAPI.ipcRenderer.invoke('readFile', path),

  saveFile: (path: string, content: string): Promise<void> => electronAPI.ipcRenderer.invoke('saveFile', path, content),

  checkForUpdates: (): Promise<void> => electronAPI.ipcRenderer.invoke('checkForUpdates'),

  quitAndInstall: (): Promise<void> => electronAPI.ipcRenderer.invoke('quitAndInstall'),

  setTitleBarOverlay: (options: Electron.TitleBarOverlay): Promise<void> =>
    electronAPI.ipcRenderer.invoke('setTitleBarOverlay', options),

  setWindowButtonPosition: (options: Electron.Point): Promise<void> =>
    electronAPI.ipcRenderer.invoke('setWindowButtonPosition', options),

  getInitialDeepLinkUri: (): Promise<string> => electronAPI.ipcRenderer.invoke('getInitialDeepLinkUri'),

  resetInitialDeeplink: (): Promise<void> => electronAPI.ipcRenderer.invoke('resetInitialDeeplink'),

  sendStoreFromWC: (store: any): void => electronAPI.ipcRenderer.send('storeFromWC', store),

  startLedger: (): void => electronAPI.ipcRenderer.send('startLedger'),

  restoreWindow: (): void => electronAPI.ipcRenderer.send('restore'),

  getConnectedLedgers: (): Promise<any> => electronAPI.ipcRenderer.invoke('getConnectedLedgers'),
}
