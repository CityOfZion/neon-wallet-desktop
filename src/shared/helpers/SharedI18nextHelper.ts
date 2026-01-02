import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { deResources } from '@shared/locales/de'
import { enResources } from '@shared/locales/en'
import { ptBrResources } from '@shared/locales/pt-br'
import { zhResources } from '@shared/locales/zh'
import { zhHantResources } from '@shared/locales/zh-Hant'

export class SharedI18nextHelper {
  static setup = () => {
    if (!i18n.isInitialized) {
      i18n.use(initReactI18next).init({
        resources: {
          en: enResources,
          de: deResources,
          'pt-BR': ptBrResources,
          zh: zhResources, // Simplified Chinese
          'zh-Hant': zhHantResources, // Traditional Chinese
        },
        ns: ['common'],
        defaultNS: 'common',
        fallbackLng: 'en',
        compatibilityJSON: 'v4',
        interpolation: {
          escapeValue: false,
        },
      })
    }
  }

  static get = () => {
    SharedI18nextHelper.setup()
    return i18n
  }
}
