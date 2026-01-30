import { app, dialog, type OpenDialogOptions, shell } from 'electron'
import { readFile, writeFile } from 'fs/promises'

import { mainApi } from '@shared/api/main'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type { TIpcMainAsyncOptions, TIpcMainBaseOptions, TSaveFileOptions } from '@shared/types/api'

const { t } = SharedI18nextHelper.get()

export class MainWindowHelper {
  static #onRestore({ window }: TIpcMainBaseOptions<undefined>) {
    if (window.isMinimized()) {
      window.restore()
    } else {
      window.show()
    }
    window.focus()
  }

  static async #onOpenDialog({ args }: TIpcMainBaseOptions<OpenDialogOptions>) {
    const result = await dialog.showOpenDialog(args)
    if (result.canceled) throw new AppError(t('errors.userCancelled'))
    return result.filePaths
  }

  static async #onReadFile({ args }: TIpcMainBaseOptions<string>) {
    const file = await readFile(args)
    return file.toString('utf-8')
  }

  static async #onSaveFile({ args }: TIpcMainBaseOptions<TSaveFileOptions>) {
    const buff = Buffer.from(args.content, 'utf-8')
    await writeFile(args.path, buff)
  }

  static async #onOpenFile({ args }: TIpcMainBaseOptions<string>) {
    const error = await shell.openPath(args)
    if (error) throw new AppError(t('errors.unexpectedError'), error)
  }

  static #onSetTitleBarOverlay({ args, window }: TIpcMainBaseOptions<Electron.TitleBarOverlay>) {
    window.setTitleBarOverlay(args)
  }

  static #onSetWindowButtonPosition({ args, window }: TIpcMainBaseOptions<Electron.Point>) {
    window.setWindowButtonPosition(args)
  }

  static #onGetVersion() {
    return app.getVersion()
  }

  static async #onToggleDevTools({ window }: TIpcMainAsyncOptions<undefined>) {
    if (window.webContents.isDevToolsOpened()) {
      window.webContents.closeDevTools()
      return
    }

    window.webContents.openDevTools({ mode: 'detach' })
  }

  static setupHandlers() {
    mainApi.listenSync('window:restore', this.#onRestore.bind(this))
    mainApi.listenAsync('window:openDialog', this.#onOpenDialog.bind(this))
    mainApi.listenAsync('window:readFile', this.#onReadFile.bind(this))
    mainApi.listenAsync('window:saveFile', this.#onSaveFile.bind(this))
    mainApi.listenAsync('window:openFile', this.#onOpenFile.bind(this))

    mainApi.listenAsync('window:setTitleBarOverlay', this.#onSetTitleBarOverlay.bind(this))
    mainApi.listenAsync('window:setWindowButtonPosition', this.#onSetWindowButtonPosition.bind(this))
    mainApi.listenSync('window:getVersion', this.#onGetVersion.bind(this))
    mainApi.listenAsync('window:toggleDevTools', this.#onToggleDevTools.bind(this))
  }
}
