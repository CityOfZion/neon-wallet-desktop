import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let initialDeepLinkUri: string | undefined = undefined

export function registerDeeplinkProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('neon', process.execPath, [path.resolve(process.argv[1])])
      app.setAsDefaultProtocolClient('neon3', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('neon')
    app.setAsDefaultProtocolClient('neon3')
  }
}

export function dispatchDeeplinkEvent(deeplinkUrl: string | undefined) {
  if (deeplinkUrl) {
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (mainWindow) {
      mainWindow.webContents.send('deeplink', deeplinkUrl)
    }
  }
}

export function setInitialDeeplink(deeplinkUrl: string | undefined) {
  initialDeepLinkUri = deeplinkUrl
}

export function registerOpenUrlListener() {
  app.on('open-url', (_event, url) => {
    initialDeepLinkUri = url

    dispatchDeeplinkEvent(url)
  })
}

export function registerDeeplinkHandler() {
  ipcMain.handle('getInitialDeepLinkUri', async () => {
    return initialDeepLinkUri
  })

  ipcMain.handle('resetInitialDeeplink', async () => {
    initialDeepLinkUri = undefined
  })
}
