import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

let initialDeepLinkUri: string | undefined = undefined
let hasDeeplink: boolean = false

export function registerNeonDeeplink() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('neon', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('neon')
  }
}

export function sendDeeplink(mainWindow: BrowserWindow, deeplinkUrl: string | undefined) {
  if (deeplinkUrl) {
    mainWindow.webContents.send('deeplink', deeplinkUrl)
  }
}

export function setDeeplink(deeplinkUrl: string | undefined) {
  initialDeepLinkUri = deeplinkUrl
}

export function registerOpenUrl(mainWindow: BrowserWindow | null) {
  app.on('open-url', (_event, url) => {
    if (!mainWindow) {
      initialDeepLinkUri = url
      hasDeeplink = true
      return
    }

    mainWindow.webContents.send('deeplink', url)
  })
}

export function registerDeeplinkHandler() {
  ipcMain.handle('getInitialDeepLinkUri', async () => {
    const uri = initialDeepLinkUri
    initialDeepLinkUri = undefined
    hasDeeplink = false
    return uri
  })

  ipcMain.handle('hasDeeplink', async () => {
    return hasDeeplink
  })
}
