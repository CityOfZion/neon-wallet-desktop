type TFormatStringOptions = {
  decimals?: number
  max?: number
  removeLeadingZero?: boolean
  removeTrailingZero?: boolean
  throwWhenNaN?: boolean
}

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

  static countDecimals(value: string | number) {
    const [, decimals] = value.toString().split('.')
    return decimals?.length ?? 0
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

  static sanitizeCommasAndDotsInNumber(value: string) {
    let newValue = value.replace(/,|\.\.|\.,|,,/g, '.')
    const parts = newValue.split('.')

    if (parts.length > 2) newValue = `${parts[0]}.${parts.slice(1).join('')}`

    return newValue
  }

  static formatString(value: string | number, options?: TFormatStringOptions) {
    const {
      decimals = 0,
      max,
      removeLeadingZero = true,
      removeTrailingZero = true,
      throwWhenNaN = false,
    } = options ?? {}

    let newValue = value.toString().trim()

    if (newValue === '') return newValue

    newValue = NumberHelper.sanitizeCommasAndDotsInNumber(newValue)

    if (isNaN(Number(newValue))) {
      if (throwWhenNaN) throw new Error('Invalid number')

      return '0'
    }

    const sciNotationRegex = /^[+-]?\d+(\.\d+)?e[+-]?\d+$/i

    if (sciNotationRegex.test(newValue)) newValue = Number(newValue).toFixed(decimals).toString()

    if (decimals === 0) {
      newValue = newValue.replace(/[^\d]/g, '')
    } else {
      newValue = newValue.replace(/[^\d.]/g, '')
      const countDecimals = this.countDecimals(newValue)

      if (countDecimals > decimals) {
        newValue = newValue.slice(0, newValue.length - countDecimals + decimals)
      }
    }

    newValue = newValue.replace(/\s|-/g, '').replace(/^([^.]*\.)(.*)$/, function (_a, b, c) {
      return b + c.replace(/\./g, '')
    })

    if (typeof max === 'number') newValue = newValue.slice(0, max)

    if (removeLeadingZero) {
      newValue = this.removeLeadingZero(newValue)
    }

    if (removeTrailingZero) {
      newValue = this.removeTrailingZero(newValue)
    }

    return newValue
  }

  static removeLeadingZero(value: string) {
    return value.replace(/^0+(?!\.)/, '') || '0'
  }

  static removeTrailingZero(value: string) {
    return value.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '')
  }

  static isBiggerThanZero(value: string) {
    return NumberHelper.number(value) > 0
  }

  static localeNumber(value: number) {
    return value.toLocaleString('en-US')
  }
}
