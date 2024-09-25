import { TextHelper } from '@renderer/helpers/TextHelper'

export class PasswordHelper {
  static readonly MINIMUM_PASSWORD_LENGTH = 4

  static #hasMinimumGoodPasswordLength(password: string) {
    return password.length >= 24
  }

  static #getPasswordConditions = (password: string) => {
    let conditions = 0

    if (TextHelper.hasUppercaseChar(password)) conditions++
    if (TextHelper.hasLowercaseChar(password)) conditions++
    if (TextHelper.hasNumberChar(password)) conditions++
    if (TextHelper.hasSpecialChar(password)) conditions++

    return conditions
  }

  static isWeakPassword(password: string) {
    return password.length >= PasswordHelper.MINIMUM_PASSWORD_LENGTH
  }

  static isGoodPassword(password: string) {
    if (!PasswordHelper.isWeakPassword(password)) return false

    const conditions = PasswordHelper.#getPasswordConditions(password)

    return (
      conditions >= 3 ||
      (conditions >= 1 && PasswordHelper.#hasMinimumGoodPasswordLength(password)) ||
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)
    )
  }

  static isStrongPassword(password: string) {
    if (!PasswordHelper.isGoodPassword(password)) return false

    return (
      (PasswordHelper.#getPasswordConditions(password) >= 3 &&
        PasswordHelper.#hasMinimumGoodPasswordLength(password)) ||
      (password.length >= 16 &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).+$/.test(password))
    )
  }
}
