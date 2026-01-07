import { app } from 'electron'
import path from 'path'

import { mainApi } from '@shared/api/main'

export class MainDeeplinkHelper {
  static initialUri: string | undefined = undefined

  static #onOpenUrl(_event: Electron.Event, url: string) {
    this.initialUri = url
    mainApi.send('deeplink:connection', url)
  }

  static #onGetInitialUri() {
    return this.initialUri
  }

  static #onResetInitialUri() {
    this.initialUri = undefined
  }

  static setupProtocol() {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('neon', process.execPath, [path.resolve(process.argv[1])])
        app.setAsDefaultProtocolClient('neon3', process.execPath, [path.resolve(process.argv[1])])
      }
    } else {
      app.setAsDefaultProtocolClient('neon')
      app.setAsDefaultProtocolClient('neon3')
    }
  }

  static setupHandler() {
    app.on('open-url', this.#onOpenUrl.bind(this))
    mainApi.listenAsync('deeplink:getInitialUri', this.#onGetInitialUri.bind(this))
    mainApi.listenAsync('deeplink:resetInitialUri', this.#onResetInitialUri.bind(this))
  }
}
