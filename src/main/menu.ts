import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'

export class MainMenuHelper {
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
              if (window.webContents.isDevToolsOpened()) {
                window.webContents.closeDevTools()
              } else {
                window.webContents.openDevTools({ mode: 'detach' })
              }
            },
          },
          {
            label: 'Toggle Always On Top',
            accelerator: isMac ? 'Ctrl+Command+T' : 'Ctrl+Shift+T',
            click: () => {
              const [window] = BrowserWindow.getAllWindows()
              if (!window) return

              window.setAlwaysOnTop(!window.isAlwaysOnTop())
            },
          },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ]

    if (isMac) {
      template.unshift({ role: 'appMenu' })
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
}
