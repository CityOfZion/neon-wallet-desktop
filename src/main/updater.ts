import { autoUpdater } from 'electron-updater'

import { mainApi } from '@shared/api/main'

export class MainUpdaterHelper {
  static #onUpdateDownloaded() {
    mainApi.send('updater:updateCompleted')
  }

  static #onUpdateError(error: Error) {
    mainApi.send('updater:updateError', error.message)
  }

  static async #onCheckForUpdates() {
    const info = await autoUpdater.checkForUpdates()
    return !!info?.cancellationToken
  }

  static #onQuitAndInstall() {
    autoUpdater.quitAndInstall()
  }

  static setupHandlers() {
    autoUpdater.on('update-downloaded', this.#onUpdateDownloaded.bind(this))
    autoUpdater.on('error', this.#onUpdateError.bind(this))

    mainApi.listenAsync('updater:checkForUpdates', this.#onCheckForUpdates.bind(this))
    mainApi.listenAsync('updater:quitAndInstall', this.#onQuitAndInstall.bind(this))
  }
}
