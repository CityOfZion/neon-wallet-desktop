export type InputType = string | number

/** @deprecated Use NumberHelper instead */
export class FilterHelper {
  static currency(input: InputType, minimumFractionDigits = 2, maximumFractionDigits = 2) {
    const num = Number(input)

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
}
