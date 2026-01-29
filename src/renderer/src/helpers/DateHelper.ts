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

  static getNowUnix = (): number => {
    return Date.now() / 1000
  }

  static getCurrentFullDateString = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
  }

  static formatLocalized = (date: Date | string | number, options: TDateHelperFormatLocalizedOptions): string => {
    if (typeof date === 'string') {
      date = new Date(date)
    } else if (typeof date === 'number') {
      date *= 1000
    }

    return dateFns.format(date, options.format, {
      locale: this.dateFnsLocaleByLanguage[options.language.value],
    })
  }

  static format(date: Date | string | number, formatStr: string): string {
    if (typeof date === 'string') {
      date = new Date(date)
    } else if (typeof date === 'number') {
      date *= 1000
    }

    return dateFns.format(date, formatStr)
  }
}
