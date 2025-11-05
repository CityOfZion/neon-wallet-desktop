import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

import { mainApi } from '@shared/api/main'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import * as packageJson from '../../package.json'
import icon from '../../resources/icon.png?asset'
import { setupHardwareWalletUsbHandler } from './hardware-wallet/usb'
import { setupBsAggregator } from './blockchain-service'
import { setInitialDeeplink, setupDeeplinkHandler, setupDeeplinkProtocol } from './deeplink'
import { setupEncryptionHandlers } from './encryption'
import { setupHardwareWalletHandler } from './hardware-wallet'
import { setupSentry } from './sentry'
import { setupUpdaterHandler } from './updater'
import { setupWalletConnectAdapters } from './wallet-connect'
import { setupWindowHandlers } from './window'

let mainWindow: BrowserWindow | null = null

setupSentry()
setupDeeplinkProtocol()

function createWindow(): void {
  const isLinux = process.platform === 'linux'

  mainWindow = new BrowserWindow({
    title: `Neon Wallet ${packageJson.version}`,
    width: 1350,
    height: 800,
    minWidth: 1350,
    minHeight: 800,
    titleBarStyle: isLinux ? 'default' : 'hidden',
    titleBarOverlay: true,
    show: false,
    backgroundColor: '#1a2026',
    ...(isLinux ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    autoHideMenuBar: true,
  })

  mainWindow.on('ready-to-show', async () => {
    await SharedUtilsHelper.sleep(500)
    mainWindow?.show()
  })

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (isLinux && input.key === 'Alt') event.preventDefault()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function initialize() {
  electronApp.setAppUserModelId('com.electron.neon3')

  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    return
  }

  app.on('second-instance', (_event, commandLine) => {
    // The commandLine is an array of strings, where the last element is the deep link URL.
    const deeplinkUrl = commandLine.pop()

    if (!mainWindow) {
      setInitialDeeplink(deeplinkUrl)
      return
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.focus()

    if (deeplinkUrl) {
      mainApi.send('deeplink', deeplinkUrl)
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupDeeplinkHandler()
  setupWindowHandlers()
  setupEncryptionHandlers()
  setupUpdaterHandler()

  await app.whenReady()

  await setupBsAggregator()
  setupWalletConnectAdapters()
  setupHardwareWalletUsbHandler()
  setupHardwareWalletHandler()

  createWindow()
}

initialize()
