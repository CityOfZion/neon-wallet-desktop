import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, shell } from 'electron'
import { join } from 'path'

import { mainApi } from '@shared/api/main'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import * as packageJson from '../../package.json'
import icon from '../../resources/icon.png?asset'
import { MainAnalyticsHelper } from './analytics'
import { MainBlockchainServiceHelper } from './blockchain-service'
import { MainDeeplinkHelper } from './deeplink'
import { MainEncryptionHelper } from './encryption'
import { MainHardwareWalletHelper } from './hardware-wallet'
import { MainMenuHelper } from './menu'
import { MainSentryHelper } from './sentry'
import { MainUpdaterHelper } from './updater'
import { MainWebAuthHelper } from './web-auth'
import { MainWindowHelper } from './window'

const isLinux = process.platform === 'linux'
const isMac = process.platform === 'darwin'
const devRendererUrl = is.dev ? process.env['ELECTRON_RENDERER_URL'] : undefined

let mainWindow: BrowserWindow | null = null

SharedEnvHelper.setup()
MainSentryHelper.setup()
MainDeeplinkHelper.setupProtocol()

if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('disable-gpu-sandbox')
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: `Neon Wallet ${packageJson.version}`,
    width: 1350,
    height: 800,
    minWidth: 1350,
    minHeight: 800,
    titleBarStyle: isMac ? 'hidden' : 'default',
    trafficLightPosition: isMac ? { x: 12, y: 8 } : undefined,
    show: false,
    backgroundColor: '#1a2026',
    ...(isLinux ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', async () => {
    await SharedUtilsHelper.sleep(500)
    mainWindow?.show()
  })

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    try {
      const { hostname } = new URL(details.url)
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        shell.openExternal(details.url)
      }
    } catch {
      // Invalid URL: ignore
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (isLinux && input.key === 'Alt') event.preventDefault()
  })

  if (is.dev && devRendererUrl) {
    mainWindow.loadURL(devRendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function initialize() {
  if (devRendererUrl) {
    electronApp.setAppUserModelId('com.electron.neon3.dev')
    app.setPath('userData', `${app.getPath('userData')} (development)`)
  } else {
    electronApp.setAppUserModelId('com.electron.neon3')
  }

  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    return
  }

  app.on('second-instance', (_event, commandLine) => {
    // The commandLine is an array of strings, where the last element is the deep link URL.
    const deeplinkUrl = commandLine.pop()

    if (!mainWindow) {
      MainDeeplinkHelper.initialUri = deeplinkUrl
      return
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.focus()

    if (deeplinkUrl) {
      mainApi.send('deeplink:connection', deeplinkUrl)
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

  await Promise.all([MainBlockchainServiceHelper.setup(), app.whenReady()]).catch(error => {
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to start Neon Wallet: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease restart the application or contact support.`
    )
    app.quit()
  })

  MainDeeplinkHelper.setupHandler()
  MainWindowHelper.setupHandlers()
  MainEncryptionHelper.setupHandlers()
  MainUpdaterHelper.setupHandlers()
  MainHardwareWalletHelper.setupHandlers()
  MainAnalyticsHelper.setupHandlers()
  MainWebAuthHelper.setupHandlers()

  MainMenuHelper.setup()

  createWindow()
}

initialize()
