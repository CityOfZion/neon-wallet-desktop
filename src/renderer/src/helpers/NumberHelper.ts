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

  static currency(input: string | number, currencyName: string, minimumFractionDigits = 2, maximumFractionDigits = 2) {
    const num = Number(input)

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyName,
        minimumFractionDigits,
        maximumFractionDigits,
      })
        .format(isNaN(num) ? 0 : num)
        .replace(/^(\D+)/, '$1 ')
        .replace(/\s+/, ' ')
    } catch {
      return '0'
    }
  }

  static formatString(value: string, decimals: number = 0) {
    let newValue = value
    if (decimals === 0) {
      newValue = newValue.replace(/[^\d]/g, '')
    } else {
      newValue = newValue.replace(/[^\d.]/g, '')
      const countDecimals = this.countDecimals(newValue)

      if (countDecimals > decimals) {
        newValue = newValue.slice(0, newValue.length - countDecimals + decimals)
      }
    }

    return newValue.replace(/\s|-/g, '').replace(/^([^.]*\.)(.*)$/, function (_a, b, c) {
      return b + c.replace(/\./g, '')
    })
  }
}
