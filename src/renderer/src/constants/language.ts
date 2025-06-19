import { TLanguage } from '@shared/@types/store'

export const defaultLanguage: TLanguage = { label: 'English', value: 'en' }

export const availableLanguages: TLanguage[] = [
  defaultLanguage,
  { label: '简体中文', value: 'zh' },
  { label: '繁體中文', value: 'zh-Hant' },
]
