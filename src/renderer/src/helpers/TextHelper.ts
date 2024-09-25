export class TextHelper {
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
