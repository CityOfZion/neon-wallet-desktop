type TFormatStringOptions = {
  decimals?: number
  max?: number
  removeLeadingZero?: boolean
  removeTrailingZero?: boolean
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

  static currency(
    input: string | number,
    currencyName: string,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showZero = true
  ) {
    const num = Number(input)

    try {
      const result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyName,
        minimumFractionDigits,
        maximumFractionDigits,
      })
        .format(isNaN(num) ? 0 : num)
        .replace(/^(\D+)/, '$1 ')
        .replace(/\s+/, ' ')

      if (!showZero && num === 0) {
        return result.replace('0', '--').replaceAll('0', '-')
      }

      return result
    } catch {
      return '0'
    }
  }

  static formatString(value: string | number, options?: TFormatStringOptions) {
    const { decimals = 0, max, removeLeadingZero = true, removeTrailingZero = true } = options ?? {}
    let newValue = value.toString().trim()

    if (isNaN(Number(newValue))) {
      throw new Error('Invalid number')
    }

    const sciNotationRegex = /^[+-]?\d+(\.\d+)?e[+-]?\d+$/i

    if (sciNotationRegex.test(newValue)) {
      const num = Number(newValue).toFixed(decimals)
      newValue = num.toString()
    }

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
    return value.replace(/^0+/, '0')
  }

  static removeTrailingZero(value: string) {
    return value.replace(/\.?0+$/, '')
  }
}
