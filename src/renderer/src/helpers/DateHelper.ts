import * as dateFns from 'date-fns'

import { DATE_FNS_LOCALE_BY_LANGUAGE_VALUE } from '@renderer/constants/language'
import { TLanguage } from '@shared/types/store'

type TFormatLocalizedOptions = {
  format: string
  language: TLanguage
}

export class DateHelper {
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

  static formatLocalized = (date: Date | string | number, options: TFormatLocalizedOptions): string => {
    if (typeof date === 'string') {
      date = new Date(date)
    } else if (typeof date === 'number') {
      date *= 1000
    }

    return dateFns.format(date, options.format, {
      locale: DATE_FNS_LOCALE_BY_LANGUAGE_VALUE[options.language.value],
    })
  }
}
