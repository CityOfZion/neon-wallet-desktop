import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'
import { match } from 'ts-pattern'

import { mainApi } from '@shared/api/main'
import { SharedConstantsHelper } from '@shared/helpers/SharedConstantsHelper'
import type { TIpcMainBaseOptions, TMenuCommand } from '@shared/types/api'

const ZOOM_STEP = 0.1
const MIN_ZOOM_FACTOR = 0.8
const MAX_ZOOM_FACTOR = 1.2

export class MainMenuHelper {
  static #setZoomFactor(window: BrowserWindow, zoomFactor: number) {
    const limitedZoomFactor = Math.min(MAX_ZOOM_FACTOR, Math.max(MIN_ZOOM_FACTOR, zoomFactor))

    window.webContents.setZoomFactor(limitedZoomFactor)

    if (process.platform !== 'darwin') {
      const height = Math.round(SharedConstantsHelper.TITLE_BAR_HEIGHT * Math.max(limitedZoomFactor, 1))
      window.setTitleBarOverlay({ height })
    }

    mainApi.send('menu:zoomFactorChanged', limitedZoomFactor)
  }

  static #onGetZoomFactor({ window }: TIpcMainBaseOptions<undefined>) {
    return window.webContents.getZoomFactor()
  }

  static #toggleDevTools(window: BrowserWindow) {
    if (window.webContents.isDevToolsOpened()) {
      window.webContents.closeDevTools()
    } else {
      window.webContents.openDevTools({ mode: 'detach' })
    }
  }

  static #toggleAlwaysOnTop(window: BrowserWindow) {
    window.setAlwaysOnTop(!window.isAlwaysOnTop())
  }

  static #runCommand(window: BrowserWindow, command: TMenuCommand) {
    const { webContents } = window

    match(command)
      .with('undo', () => webContents.undo())
      .with('redo', () => webContents.redo())
      .with('cut', () => webContents.cut())
      .with('copy', () => webContents.copy())
      .with('paste', () => webContents.paste())
      .with('delete', () => webContents.delete())
      .with('selectAll', () => webContents.selectAll())
      .with('reload', () => webContents.reload())
      .with('forceReload', () => webContents.reloadIgnoringCache())
      .with('toggleDevTools', () => this.#toggleDevTools(window))
      .with('toggleAlwaysOnTop', () => this.#toggleAlwaysOnTop(window))
      .with('resetZoom', () => this.#setZoomFactor(window, 1))
      .with('zoomIn', () => this.#setZoomFactor(window, webContents.getZoomFactor() + ZOOM_STEP))
      .with('zoomOut', () => this.#setZoomFactor(window, webContents.getZoomFactor() - ZOOM_STEP))
      .with('toggleFullScreen', () => window.setFullScreen(!window.isFullScreen()))
      .exhaustive()
  }

  static #buildCommandItem(label: string, accelerator: string, command: TMenuCommand): MenuItemConstructorOptions {
    return {
      label,
      accelerator,
      click: () => {
        const [window] = BrowserWindow.getAllWindows()
        if (!window) return

        this.#runCommand(window, command)
      },
    }
  }

  static #onRunCommand({ args, window }: TIpcMainBaseOptions<TMenuCommand>) {
    this.#runCommand(window, args)
  }

  // Zoom keys the menu accelerators don't cover: Ctrl+= (zoomIn is bound to Ctrl+Plus, which needs Shift on US layouts)
  // and the numpad. The = check uses the typed character so it follows the keyboard layout for non-US layouts
  static setupZoomShortcuts(window: BrowserWindow) {
    window.webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown' || !(input.control || input.meta)) return

      const command = match(input)
        .returnType<TMenuCommand | undefined>()
        .with({ key: '=' }, () => 'zoomIn')
        .with({ code: 'NumpadAdd' }, () => 'zoomIn')
        .with({ code: 'NumpadSubtract' }, () => 'zoomOut')
        .with({ code: 'Numpad0' }, () => 'resetZoom')
        .otherwise(() => undefined)

      if (!command) return

      event.preventDefault()
      this.#runCommand(window, command)
    })
  }

  static setup() {
    const isMac = process.platform === 'darwin'

    const template: MenuItemConstructorOptions[] = [
      { role: 'editMenu' },
      {
        role: 'viewMenu',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          {
            label: 'Toggle DevTools',
            accelerator: 'F12',
            click: () => {
              const [window] = BrowserWindow.getAllWindows()
              if (!window) return

              this.#toggleDevTools(window)
            },
          },
          {
            label: 'Toggle Always On Top',
            accelerator: isMac ? 'Ctrl+Command+T' : 'Ctrl+Shift+T',
            click: () => {
              const [window] = BrowserWindow.getAllWindows()
              if (!window) return

              this.#toggleAlwaysOnTop(window)
            },
          },
          { type: 'separator' },
          this.#buildCommandItem('Actual size', 'CommandOrControl+0', 'resetZoom'),
          this.#buildCommandItem('Zoom in', 'CommandOrControl+Plus', 'zoomIn'),
          this.#buildCommandItem('Zoom out', 'CommandOrControl+-', 'zoomOut'),
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ]

    if (isMac) {
      template.unshift({ role: 'appMenu' })
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    mainApi.listenAsync('menu:runCommand', this.#onRunCommand.bind(this))
    mainApi.listenSync('menu:getZoomFactor', this.#onGetZoomFactor.bind(this))
  }
}
