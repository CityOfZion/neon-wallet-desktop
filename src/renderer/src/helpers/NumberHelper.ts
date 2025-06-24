type TCurrencyOptions = {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showZero?: boolean
  approximateSymbol?: boolean
}

export class NumberHelper {
  static number(input: string | number) {
    if (typeof input === 'number') {
      return input
    }

    return parseFloat(input) || 0
  }

  static currency(input: string | number, currencyName: string, options?: TCurrencyOptions) {
    const {
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showZero = true,
      approximateSymbol = false,
    } = options ?? {}

    const num = Number(input)
    let result = '0'

    try {
      result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyName,
        minimumFractionDigits,
        maximumFractionDigits,
      })
        .format(isNaN(num) ? 0 : num)
        .replace(/^(\D+)/, '$1 ')
        .replace(/\s+/, ' ')

      if (!showZero && num === 0) result = result.replace('0', '--').replaceAll('0', '-')
    } catch (error) {
      console.error(error)
    }

    if (approximateSymbol) result = `~${result}`

    return result
  }

  static isBiggerThanZero(value: string) {
    return NumberHelper.number(value) > 0
  }

  static localeNumber(value: number) {
    return value.toLocaleString('en-US')
  }
}
