import { TMainApiListenersAsync, TMainApiListenersSync, TMainApiSend } from '@shared/@types/api'
import {} from '@shared/@types/ipc'
import { BrowserWindow, ipcMain } from 'electron'

function listenSync<
  K extends keyof TMainApiListenersSync = keyof TMainApiListenersSync,
  L extends TMainApiListenersSync[K] = TMainApiListenersSync[K],
>(channel: K, listener: L) {
  ipcMain.on(channel, (event, args) => {
    const [window] = BrowserWindow.getAllWindows()
    if (!window) return

    const removeAllListeners = () => ipcMain.removeAllListeners(channel)

    const returnValue = listener({ event, args, window, removeAllListeners } as any)
    event.returnValue = returnValue
  })
}

function listenAsync<
  K extends keyof TMainApiListenersAsync = keyof TMainApiListenersAsync,
  L extends TMainApiListenersAsync[K] = TMainApiListenersAsync[K],
>(channel: K, listener: L) {
  ipcMain.handle(channel, (event, args) => {
    const [window] = BrowserWindow.getAllWindows()
    if (!window) return

    const removeAllListeners = () => ipcMain.removeAllListeners(channel)
    return listener({ event, args, window, removeAllListeners } as any)
  })
}

function send<K extends keyof TMainApiSend = keyof TMainApiSend, T extends TMainApiSend[K] = TMainApiSend[K]>(
  ...args: T extends undefined ? [K] : [K, T]
) {
  const [window] = BrowserWindow.getAllWindows()
  if (!window) return

  const channel = args[0]
  const params = args[1]

  window.webContents.send(channel, params)
}

export const mainApi = {
  listenAsync,
  listenSync,
  send,
}
