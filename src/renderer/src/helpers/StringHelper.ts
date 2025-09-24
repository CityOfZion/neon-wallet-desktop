export class StringHelper {
  static truncateString(str: string, maxLength: number) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '…'
    }
    return str
  }

  static truncateStringStart(str: string, maxLength: number) {
    if (str.length > maxLength) {
      const half = maxLength / 2
      return '…' + str.substring(str.length - half)
    }
    return str
  }

  static truncateStringMiddle(str: string, maxLength: number) {
    if (str.length > maxLength) {
      const half = maxLength / 2
      return str.substring(0, half) + '…' + str.substring(str.length - half)
    }
    return str
  }

  static normalizeText(text: string) {
    return text.trim().toLowerCase()
  }

  static validateValue(value: string, maxLength: number = 30) {
    const trimmedValue = value.trim()
    const isEmpty = trimmedValue.length === 0
    const isTooLong = trimmedValue.length > maxLength

    return {
      trimmedValue,
      isEmpty,
      isTooLong,
      isValid: !isEmpty && !isTooLong,
    }
  }
}
