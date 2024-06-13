import { BSAggregator } from '@cityofzion/blockchain-service'
import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

import * as packageJson from '../../package.json'
import icon from '../../resources/icon.png?asset'

import {
  dispatchDeeplinkEvent,
  registerDeeplinkHandler,
  registerDeeplinkProtocol,
  registerOpenUrlListener,
  setInitialDeeplink,
} from './deeplink'
import { registerEncryptionHandlers } from './encryption'
import { getLedgerTransport, registerLedgerHandler } from './ledger'
import { setupSentry } from './sentryElectron'
import { registerUpdaterHandler } from './updater'
import { registerWindowHandlers } from './window'

const gotTheLock = app.requestSingleInstanceLock()
let mainWindow: BrowserWindow | null = null

registerDeeplinkProtocol()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: `Neon Wallet ${packageJson.version}`,
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    autoHideMenuBar: true,
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!gotTheLock) {
  app.quit()
} else {
  setupSentry()

  app.on('second-instance', (_event, commandLine) => {
    // The commandLine is an array of strings, where the last element is the deep link URL.
    const deeplinkUrl = commandLine.pop()
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      dispatchDeeplinkEvent(deeplinkUrl)
    } else {
      setInitialDeeplink(deeplinkUrl)
    }
  })

  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  registerOpenUrlListener()

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  const bsAggregator = new BSAggregator({
    neo3: new BSNeo3('neo3', { type: 'mainnet' }, getLedgerTransport),
    neoLegacy: new BSNeoLegacy('neoLegacy', { type: 'mainnet' }),
    ethereum: new BSEthereum('ethereum', { type: 'mainnet' }, getLedgerTransport),
  })

  registerUpdaterHandler()
  registerWindowHandlers()
  registerEncryptionHandlers()
  registerLedgerHandler(bsAggregator)
  exposeApiToRenderer(bsAggregator)
  registerDeeplinkHandler()
}
