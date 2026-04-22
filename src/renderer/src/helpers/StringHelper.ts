import type { TStringHelperRemoveSpecialCharacterOptions } from '@shared/types/helpers'

export class StringHelper {
  static truncate(text: string, maxLength: number) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '…'
    }

    return text
  }

  static truncateStart(text: string, maxLength: number) {
    if (text.length > maxLength) {
      const half = maxLength / 2

      return '…' + text.substring(text.length - half)
    }

    return text
  }

  static truncateMiddle(text: string, maxLength: number) {
    if (text.length > maxLength) {
      const half = maxLength / 2

      return text.substring(0, half) + '…' + text.substring(text.length - half)
    }

    return text
  }

  static normalizeText(text: string) {
    return text.trim().toLowerCase()
  }

  static validateValue(value: string, maxLength: number) {
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
}
