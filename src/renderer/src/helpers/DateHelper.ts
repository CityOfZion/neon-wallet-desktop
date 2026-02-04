import * as dateFns from 'date-fns'
import * as dateFnsLocales from 'date-fns/locale'

import type { TDateHelperFormatLocalizedOptions } from '@shared/types/helpers'

export class DateHelper {
  static readonly dateFnsLocaleByLanguage: Record<string, dateFns.Locale> = {
    en: dateFnsLocales.enUS,
    de: dateFnsLocales.de,
    'pt-BR': dateFnsLocales.ptBR,
    zh: dateFnsLocales.zhCN,
    'zh-Hant': dateFnsLocales.zhTW,
  }

  static getCurrentFullDateString = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
  }

  static formatLocalized = (date: Date | string, options: TDateHelperFormatLocalizedOptions): string => {
    if (typeof date === 'string') {
      date = new Date(date)
    }

    return dateFns.format(date, options.format, {
      locale: this.dateFnsLocaleByLanguage[options.language.value],
    })
  }

  static format(date: Date | string, formatStr: string): string {
    if (typeof date === 'string') {
      date = new Date(date)
    }

    return dateFns.format(date, formatStr)
  }
}
