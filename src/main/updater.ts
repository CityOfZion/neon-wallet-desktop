import { autoUpdater } from 'electron-updater'

import { mainApi } from '@shared/api/main'

export function setupUpdaterHandler() {
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
