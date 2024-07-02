import { electronAPI } from '@electron-toolkit/preload'
import { TMainApiListenersAsync, TMainApiListenersSync, TMainApiSend } from '@shared/@types/api'
import { TIpcRendererListener, TIpcRendererSendArgs, TIpcRendererSendResponse } from '@shared/@types/ipc'

function sendSync<
  K extends keyof TMainApiListenersSync = keyof TMainApiListenersSync,
  T extends TIpcRendererSendArgs<TMainApiListenersSync[K]> = TIpcRendererSendArgs<TMainApiListenersSync[K]>,
  R extends TIpcRendererSendResponse<TMainApiListenersSync[K]> = TIpcRendererSendResponse<TMainApiListenersSync[K]>,
>(...args: T extends undefined ? [K] : [K, T]): R {
  const channel = args[0]
  const params = args[1]

  return electronAPI.ipcRenderer.sendSync(channel, params)
}

function sendAsync<
  K extends keyof TMainApiListenersAsync = keyof TMainApiListenersAsync,
  T extends TIpcRendererSendArgs<TMainApiListenersAsync[K]> = TIpcRendererSendArgs<TMainApiListenersAsync[K]>,
  R extends TIpcRendererSendResponse<TMainApiListenersAsync[K]> = TIpcRendererSendResponse<TMainApiListenersAsync[K]>,
>(...args: T extends undefined ? [K] : [K, T]): Promise<R> {
  const channel = args[0]
  const params = args[1]

  return electronAPI.ipcRenderer.invoke(channel, params)
}

function listen<K extends keyof TMainApiSend = keyof TMainApiSend, T extends TMainApiSend[K] = TMainApiSend[K]>(
  channel: K,
  listener: TIpcRendererListener<T, void>
) {
  return electronAPI.ipcRenderer.on(channel, (event, args) => {
    listener({ event, args })
  })
}

export const rendererApi = {
  sendSync,
  sendAsync,
  listen,
}
