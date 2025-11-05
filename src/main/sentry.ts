import * as Sentry from '@sentry/electron/main'

import { sentryConfig } from '../../sentry.config'

const isProductionMode = Boolean(import.meta.env?.VITE_SENTRY_DSN && import.meta.env.PROD)

export function setupSentry() {
  if (!isProductionMode) return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    ipcMode: Sentry.IPCMode.Classic,
    ...sentryConfig,
  })
}
