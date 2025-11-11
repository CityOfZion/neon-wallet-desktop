import { TAvailableCurrency, TCurrency } from '@shared/types/store'

export const availableCurrencies: TCurrency[] = [
  { symbol: 'U$', label: 'USD' },
  { symbol: '€', label: 'EUR' },
  { symbol: '£', label: 'GBP' },
  { symbol: 'R$', label: 'BRL' },
  { symbol: '¥', label: 'CNY' },
]

export const LOCALE_BY_CURRENCY_LABEL: Record<TAvailableCurrency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  BRL: 'pt-BR',
  CNY: 'zh-CN',
}
