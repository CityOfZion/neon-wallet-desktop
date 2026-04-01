import * as dateFns from 'date-fns'
import * as dateFnsLocales from 'date-fns/locale'

import type { TDateHelperFormatLocalizedOptions } from '@shared/types/helpers'

type TDate = Date | string | number

export class DateHelper {
  static readonly dateFnsLocaleByLanguage: Record<string, dateFns.Locale> = {
    en: dateFnsLocales.enUS,
    de: dateFnsLocales.de,
    'pt-BR': dateFnsLocales.ptBR,
    zh: dateFnsLocales.zhCN,
    'zh-Hant': dateFnsLocales.zhTW,
  }

  static #fixDate(date: TDate): TDate {
    if (typeof date === 'string') {
      return new Date(date)
    }

    return date
  }

  static getCurrentFullDateString = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')

    return `${year}${month}${day}`
  }

  static formatLocalized = (date: TDate, options: TDateHelperFormatLocalizedOptions): string => {
    return dateFns.format(this.#fixDate(date), options.format, {
      locale: this.dateFnsLocaleByLanguage[options.language.value],
    })
  }

  static format(date: TDate, formatString: string): string {
    return dateFns.format(this.#fixDate(date), formatString)
  }
}
