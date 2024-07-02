import { mainApi } from '@shared/api/main'
import { app } from 'electron'
import path from 'path'

let initialDeepLinkUri: string | undefined = undefined

export function registerDeeplinkProtocol() {
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

export function setInitialDeeplink(deeplinkUrl: string | undefined) {
  initialDeepLinkUri = deeplinkUrl
}

export function registerOpenUrlListener() {
  app.on('open-url', (_event, url) => {
    initialDeepLinkUri = url

    mainApi.send('deeplink', url)
  })
}

export function registerDeeplinkHandler() {
  mainApi.listenAsync('getInitialDeepLinkUri', () => {
    return initialDeepLinkUri
  })

  mainApi.listenAsync('resetInitialDeeplink', () => {
    initialDeepLinkUri = undefined
  })
}
