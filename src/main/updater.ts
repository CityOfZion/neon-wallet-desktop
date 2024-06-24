import { BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

export function registerUpdaterHandler() {
  autoUpdater.on('update-downloaded', () => {
    const browserWindow = BrowserWindow.getAllWindows()[0]
    if (!browserWindow) return
    browserWindow.webContents.send('updateCompleted')
  })
  ipcMain.handle('checkForUpdates', async () => {
    await autoUpdater.checkForUpdates()
  })

  ipcMain.handle('quitAndInstall', () => {
    autoUpdater.quitAndInstall()
  })
}
