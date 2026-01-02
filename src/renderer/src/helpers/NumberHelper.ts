import type { TCurrency } from '@shared/types/store'

import { CurrencyHelper } from './CurrencyHelper'

export class NumberHelper {
  static number(input: string | number) {
    if (typeof input === 'number') {
      return input
    }

    return parseFloat(input) || 0
  }

  static localeNumber(value: number, currency: TCurrency) {
    return value.toLocaleString(CurrencyHelper.localeByCurrencyLabel[currency.label])
  }

  static getRandomNumber(max: number) {
    return Math.floor(Math.random() * Math.floor(max))
  }
}
