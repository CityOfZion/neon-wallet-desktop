import * as Sentry from '@sentry/electron/renderer'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import type { TSentryHelperOptions } from '@shared/types/helpers'

import { sentryConfig } from '../../../../sentry.config'

export class SentryHelper {
  static capture(error: unknown, options: TSentryHelperOptions) {
    if (!SharedEnvHelper.PROD) return

    Sentry.captureException(error, {
      level: options?.level,
      tags: { where: options?.where, operation: options?.operation },
    })
  }

  static setup() {
    if (!SharedEnvHelper.VITE_SENTRY_DSN || !SharedEnvHelper.PROD) return

    Sentry.init({
      dsn: SharedEnvHelper.VITE_SENTRY_DSN,
      ...sentryConfig,
    })
  }
}
