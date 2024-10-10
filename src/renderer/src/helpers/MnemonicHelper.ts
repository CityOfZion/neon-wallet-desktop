export class MnemonicHelper {
  static isMnemonic(word: string | string[]) {
    const wordArray = Array.isArray(word) ? word : word.trim().split(' ')

    return wordArray.length > 1
  }

  static isValidMnemonic(word: string | string[]) {
    const wordArray = Array.isArray(word) ? word : word.trim().split(' ')

    return wordArray.length === 12
  }

  static extractIndexFromPath(bip44Path: string): number {
    return parseInt(bip44Path.split('/').pop()!)
  }
}
