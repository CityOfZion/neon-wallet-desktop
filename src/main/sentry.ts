import * as Sentry from '@sentry/electron/main'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'

import { sentryConfig } from '../../sentry.config'

export class MainSentryHelper {
  static setup() {
    if (!SharedEnvHelper.VITE_SENTRY_DSN || !SharedEnvHelper.PROD) return

    Sentry.init({
      dsn: SharedEnvHelper.VITE_SENTRY_DSN,
      ipcMode: Sentry.IPCMode.Classic,
      ...sentryConfig,
    })
  }
}
