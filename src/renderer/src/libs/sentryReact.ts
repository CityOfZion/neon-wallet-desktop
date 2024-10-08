import * as React from 'react'
import { createHashRouter } from 'react-router-dom'
import * as ElectronRedererSentry from '@sentry/electron/renderer'
import * as ReactSentry from '@sentry/react'

import { sentryConfig } from '../../../../sentry.config'

const isProductionMode = Boolean(import.meta.env?.VITE_SENTRY_DSN && import.meta.env.PROD)
export function setupSentryReact() {
  if (isProductionMode) {
    ElectronRedererSentry.init(
      {
        dsn: import.meta.env.VITE_SENTRY_DSN,
        ...sentryConfig,
        integrations: [
          ElectronRedererSentry.breadcrumbsIntegration(),
          ElectronRedererSentry.browserApiErrorsIntegration(),
          ElectronRedererSentry.browserProfilingIntegration(),
          ElectronRedererSentry.dedupeIntegration(),
          ElectronRedererSentry.functionToStringIntegration(),
          ElectronRedererSentry.linkedErrorsIntegration(),
          ElectronRedererSentry.scopeToMainIntegration(),
        ],
        anrDetection: { captureStackTrace: true },
      },
      ReactSentry.init
    )
  }
}

export function setupSentryWrapper(app: React.ComponentType) {
  return isProductionMode ? ReactSentry.withProfiler(app) : app
}

export function createRouteHandler() {
  return isProductionMode ? ReactSentry.wrapCreateBrowserRouter(createHashRouter) : createHashRouter
}
