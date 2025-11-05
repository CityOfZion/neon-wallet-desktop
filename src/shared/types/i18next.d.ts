import 'i18next'

import { enResources } from '@shared/locales/en'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: typeof enResources
  }
}
