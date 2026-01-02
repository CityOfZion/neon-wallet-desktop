import shuffle from 'lodash/shuffle'

import { NumberHelper } from './NumberHelper'
export class PasswordHelper {
  static readonly minimumPasswordLength = 4

  static #hasMinimumGoodPasswordLength(password: string) {
    return password.length >= 24
  }

  static #getPasswordConditions = (password: string) => {
    let conditions = 0

    if (/[A-Z]/.test(password)) conditions++
    if (/[a-z]/.test(password)) conditions++
    if (/\d/.test(password)) conditions++
    if (/[^a-zA-Z\d]/.test(password)) conditions++

    return conditions
  }

  static isWeakPassword(password: string) {
    return password.length >= PasswordHelper.minimumPasswordLength
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

  static generateStrongPassword() {
    const passwordLength = 15
    const steps = passwordLength / 4

    const symbolCharacters = '!@#$%^&*()_+[\\]{};\':"\\|,.<>/?'

    let password = ''

    for (let i = 0; i < steps; i++) {
      password += NumberHelper.getRandomNumber(9).toString()
      password += symbolCharacters.charAt(Math.floor(Math.random() * symbolCharacters.length))
      password += String.fromCharCode(Math.floor(Math.random() * 26) + 65)
      password += String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    }

    return shuffle(password).join('')
  }
}
