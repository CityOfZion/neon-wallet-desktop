import * as ElectronSentry from '@sentry/electron/main'
import { IPCMode } from '@sentry/electron/main'
import { ExitReason } from '@sentry/electron/main/electron-normalize'
import { session } from 'electron'

import { sentryConfig } from '../../sentry.config'

const isProductionMode = Boolean(import.meta.env?.VITE_SENTRY_DSN && import.meta.env.PROD)

const exitReasons: ExitReason[] = [
  'clean-exit',
  'abnormal-exit',
  'killed',
  'crashed',
  'oom',
  'launch-failed',
  'integrity-failure',
]

export function setupSentry() {
  if (isProductionMode) {
    ElectronSentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      ...sentryConfig,
      getSessions: () => [session.defaultSession, session.fromPartition('persist:my-session')],
      integrations: [
        ElectronSentry.browserWindowSessionIntegration(),
        ElectronSentry.childProcessIntegration({
          events: exitReasons,
          breadcrumbs: exitReasons,
        }),
        new ElectronSentry.Integrations.Console(),
        new ElectronSentry.Integrations.ContextLines(),
        ElectronSentry.electronBreadcrumbsIntegration(),
        ElectronSentry.electronMinidumpIntegration(),
        ElectronSentry.functionToStringIntegration(),
        ElectronSentry.linkedErrorsIntegration(),
        ElectronSentry.mainProcessSessionIntegration({ sendOnCreate: true }),
        new ElectronSentry.Integrations.Modules(),
      ],
      ipcMode: IPCMode.Both,
    })
  }
}
