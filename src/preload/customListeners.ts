import { electronAPI, IpcRendererListener } from '@electron-toolkit/preload'

export const customListeners = {
  getStoreFromWC: (listener: IpcRendererListener) => electronAPI.ipcRenderer.on('getStoreFromWC', listener),

  ledgerConnected: (listener: IpcRendererListener) => electronAPI.ipcRenderer.on('ledgerConnected', listener),

  ledgerDisconnected: (listener: IpcRendererListener) => electronAPI.ipcRenderer.on('ledgerDisconnected', listener),

  updateCompleted: (listener: IpcRendererListener) => electronAPI.ipcRenderer.on('updateCompleted', listener),

  deeplink: (listener: IpcRendererListener) => electronAPI.ipcRenderer.on('deeplink', listener),

  getLedgerSignatureStart: (listener: IpcRendererListener) =>
    electronAPI.ipcRenderer.on('getLedgerSignatureStart', listener),

  getLedgerSignatureEnd: (listener: IpcRendererListener) =>
    electronAPI.ipcRenderer.on('getLedgerSignatureEnd', listener),
}
