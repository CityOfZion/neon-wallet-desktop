import type { TStringHelperRemoveSpecialCharacterOptions } from '@shared/types/helpers'

export class StringHelper {
  static capitalize(text: string) {
    if (text.length === 0) return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

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

  static removeSpecialCharacters(text: string, options?: TStringHelperRemoveSpecialCharacterOptions) {
    options = { allowSpaces: true, trimText: false, ...options }

    let regex = 'a-zA-Z0-9'
    if (options.allowDots) {
      regex += '.'
    }

    if (options.allowSpaces) {
      regex += ' '
    }
    text = text.replace(new RegExp(`[^${regex}]`, 'g'), '')

    if (options.trimText) text = text.trim()

    return text
  }

  static hasUppercaseChar(text: string) {
    return /[A-Z]/.test(text)
  }

  static hasLowercaseChar(text: string) {
    return /[a-z]/.test(text)
  }

  static hasNumberChar(text: string) {
    return /\d/.test(text)
  }

  static hasSpecialChar(text: string) {
    return /[^a-zA-Z\d]/.test(text)
  }
}
