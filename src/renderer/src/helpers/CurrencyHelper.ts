import type { TCurrencyHelperFormatOptions } from '@shared/types/helpers'
import type { TAvailableCurrency, TCurrency } from '@shared/types/store'

import { LoggerHelper } from './LoggerHelper'

export class CurrencyHelper {
  static readonly availableCurrencies: TCurrency[] = [
    { symbol: 'U$', label: 'USD' },
    { symbol: '€', label: 'EUR' },
    { symbol: '£', label: 'GBP' },
    { symbol: 'R$', label: 'BRL' },
    { symbol: '¥', label: 'CNY' },
  ]

  static readonly defaultCurrency: TCurrency = CurrencyHelper.availableCurrencies[0]

  static readonly localeByCurrencyLabel: Record<TAvailableCurrency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    BRL: 'pt-BR',
    CNY: 'zh-CN',
  }

  static format(input: string | number, options: TCurrencyHelperFormatOptions) {
    const {
      currency,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showZero = true,
      approximateSymbol = false,
    } = options || {}

    const num = Number(input)
    let result = '0'

    try {
      result = new Intl.NumberFormat(this.localeByCurrencyLabel[currency.label], {
        style: 'currency',
        currency: currency.label,
        minimumFractionDigits,
        maximumFractionDigits,
      })
        .format(isNaN(num) ? 0 : num)
        .replace(/^(\D+)/, '$1 ')
        .replace(/\s+/, ' ')

      if (!showZero && num === 0) result = result.replace('0', '--').replaceAll('0', '-')
    } catch (error) {
      LoggerHelper.error(error, { where: 'CurrencyHelper', operation: 'format' })
    }

    if (approximateSymbol) result = `~${result}`

    return result
  }
}
