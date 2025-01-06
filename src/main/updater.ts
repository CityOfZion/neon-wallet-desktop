import { mainApi } from '@shared/api/main'
import { autoUpdater } from 'electron-updater'

export function registerUpdaterHandler() {
  autoUpdater.on('update-downloaded', () => {
    mainApi.send('updateCompleted')
  })

  autoUpdater.on('error', error => {
    mainApi.send('updateError', error.message)
  })

  mainApi.listenAsync('checkForUpdates', async () => {
    const info = await autoUpdater.checkForUpdates()
    return !!info?.cancellationToken
  })

  mainApi.listenAsync('quitAndInstall', async () => {
    autoUpdater.quitAndInstall()
  })
}
