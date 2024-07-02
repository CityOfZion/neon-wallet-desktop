import { mainApi } from '@shared/api/main'
import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export function registerUpdaterHandler() {
  autoUpdater.on('update-downloaded', () => {
    const browserWindow = BrowserWindow.getAllWindows()[0]
    if (!browserWindow) return
    browserWindow.webContents.send('updateCompleted')
  })

  mainApi.listenAsync('checkForUpdates', async () => {
    await autoUpdater.checkForUpdates()
  })

  mainApi.listenAsync('quitAndInstall', async () => {
    autoUpdater.quitAndInstall()
  })
}
