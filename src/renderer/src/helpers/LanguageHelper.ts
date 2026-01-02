import type { TLanguage } from '@shared/types/store'

export class LanguageHelper {
  static readonly availableLanguages: TLanguage[] = [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Português (BR)', value: 'pt-BR' },
    { label: '简体中文', value: 'zh' },
    { label: '繁體中文', value: 'zh-Hant' },
  ]

  static readonly defaultLanguage: TLanguage = this.availableLanguages[0]
}
