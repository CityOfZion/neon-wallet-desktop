import { BrowserOptions } from '@sentry/electron/renderer'

import { version } from './package.json'

export const sentryConfig: Omit<BrowserOptions, 'transportOptions' | 'transport'> = {
  environment: 'NEON-3',
  release: version,
  tracesSampleRate: 1.0,
  sendDefaultPii: false,
}
