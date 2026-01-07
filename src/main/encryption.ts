import { safeStorage } from 'electron'
import crypto from 'node:crypto'

import { mainApi } from '@shared/api/main'
import {
  TDecryptBasedEncryptedSecretParams,
  TDecryptBasedSecretParams,
  TEncryptBasedEncryptedSecretParams,
  TEncryptBasedSecretParams,
  type TIpcMainBaseOptions,
} from '@shared/types/api'

const ALGORITHM = 'aes-192-cbc'

export class MainEncryptionHelper {
  static #onEncryptBasedOS({ args }: TIpcMainBaseOptions<string>) {
    // When running Playwright on Linux, encryption is not available, which ensures that there will be a key to encrypt
    if (process.platform === 'linux' && !safeStorage.isEncryptionAvailable())
      safeStorage.setUsePlainTextEncryption(true)

    const buffer = safeStorage.encryptString(args)
    return buffer.toString('base64')
  }

  static #onDecryptBasedOS({ args }: TIpcMainBaseOptions<string>) {
    const buffer = Buffer.from(args, 'base64')
    return safeStorage.decryptString(buffer)
  }

  static #onEncryptBasedSecret({ args: { secret, value, options } }: TIpcMainBaseOptions<TEncryptBasedSecretParams>) {
    const iv = crypto.randomBytes(16)

    let key: Buffer
    if (options?.algorithm === 'pbkdf2') {
      key = crypto.pbkdf2Sync(secret, 'salt', 100000, 24, 'sha256')
    } else {
      key = crypto.scryptSync(secret, 'salt', 24)
    }

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = cipher.update(value, 'utf8', 'hex') + cipher.final('hex')
    return iv.toString('hex') + encrypted
  }

  static #onDecryptBasedSecret({ args: { secret, value, options } }: TIpcMainBaseOptions<TDecryptBasedSecretParams>) {
    const iv = Buffer.from(value.slice(0, 32), 'hex')

    let key: Buffer
    if (options?.algorithm === 'pbkdf2') {
      key = crypto.pbkdf2Sync(secret, 'salt', 100000, 24, 'sha256')
    } else {
      key = crypto.scryptSync(secret, 'salt', 24)
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    return decipher.update(value.slice(32), 'hex', 'utf8') + decipher.final('utf8')
  }

  static #onEncryptBasedEncryptedSecret(params: TIpcMainBaseOptions<TEncryptBasedEncryptedSecretParams>) {
    const { value, encryptedSecret, options } = params.args

    if (!encryptedSecret) {
      return this.#onEncryptBasedOS({ ...params, args: value })
    }

    const secret = this.#onDecryptBasedOS({ ...params, args: encryptedSecret })
    const encryptedBySecretValue = this.#onEncryptBasedSecret({ ...params, args: { secret, value, options } })
    return this.#onEncryptBasedOS({ ...params, args: encryptedBySecretValue })
  }

  static #onDecryptBasedEncryptedSecret(params: TIpcMainBaseOptions<TDecryptBasedEncryptedSecretParams>) {
    const { value, encryptedSecret, options } = params.args

    if (!encryptedSecret) {
      return this.#onDecryptBasedOS({ ...params, args: value })
    }

    const decryptedByOSValue = this.#onDecryptBasedOS({ ...params, args: value })
    const secret = this.#onDecryptBasedOS({ ...params, args: encryptedSecret })
    return this.#onDecryptBasedSecret({ ...params, args: { secret, value: decryptedByOSValue, options } })
  }

  static #generateRandomHex({ args = 32 }: TIpcMainBaseOptions<number | undefined>) {
    return crypto.randomBytes(args).toString('hex')
  }

  static setupHandlers() {
    mainApi.listenAsync('encryption:encryptBasedOS', this.#onEncryptBasedOS.bind(this))
    mainApi.listenAsync('encryption:decryptBasedOS', this.#onDecryptBasedOS.bind(this))
    mainApi.listenSync('encryption:encryptBasedOSSync', this.#onEncryptBasedOS.bind(this))
    mainApi.listenSync('encryption:decryptBasedOSSync', this.#onDecryptBasedOS.bind(this))

    mainApi.listenAsync('encryption:encryptBasedSecret', this.#onEncryptBasedSecret.bind(this))
    mainApi.listenAsync('encryption:decryptBasedSecret', this.#onDecryptBasedSecret.bind(this))

    mainApi.listenAsync('encryption:encryptBasedEncryptedSecret', this.#onEncryptBasedEncryptedSecret.bind(this))
    mainApi.listenAsync('encryption:decryptBasedEncryptedSecret', this.#onDecryptBasedEncryptedSecret.bind(this))
    mainApi.listenSync('encryption:encryptBasedEncryptedSecretSync', this.#onEncryptBasedEncryptedSecret.bind(this))
    mainApi.listenSync('encryption:decryptBasedEncryptedSecretSync', this.#onDecryptBasedEncryptedSecret.bind(this))

    mainApi.listenSync('encryption:generateRandomHexSync', this.#generateRandomHex.bind(this))
  }
}
