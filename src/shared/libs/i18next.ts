import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { deResources } from '@shared/locales/de'
import { enResources } from '@shared/locales/en'
import { zhResources } from '@shared/locales/zh'
import { zhHantResources } from '@shared/locales/zh-Hant'

export const setupI18next = () => {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: enResources,
        zh: zhResources, // Simplified Chinese
        'zh-Hant': zhHantResources, // Traditional Chinese
        de: deResources,
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

export const getI18next = () => {
  setupI18next()

  return i18n
}
