import { safeStorage } from 'electron'
import crypto from 'node:crypto'

import { mainApi } from '@shared/api/main'
import {
  TDecryptBasedEncryptedSecretParams,
  TDecryptBasedSecretParams,
  TEncryptBasedEncryptedSecretParams,
  TEncryptBasedSecretParams,
} from '@shared/types/ipc'

const ALGORITHM = 'aes-192-cbc'

function encryptBasedOS(value: string) {
  // When running Playwright on Linux, encryption is not available, which ensures that there will be a key to encrypt
  if (process.platform === 'linux' && !safeStorage.isEncryptionAvailable()) safeStorage.setUsePlainTextEncryption(true)

  const buffer = safeStorage.encryptString(value)
  return buffer.toString('base64')
}

function decryptBasedOS(value: string) {
  const buffer = Buffer.from(value, 'base64')
  return safeStorage.decryptString(buffer)
}

function encryptBasedSecret({ secret, value, options }: TEncryptBasedSecretParams) {
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

function decryptBasedSecret({ secret, value, options }: TDecryptBasedSecretParams) {
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

function encryptBasedEncryptedSecret({ value, encryptedSecret, options }: TEncryptBasedEncryptedSecretParams) {
  if (!encryptedSecret) {
    return encryptBasedOS(value)
  }

  const secret = decryptBasedOS(encryptedSecret)
  const encryptedBySecretValue = encryptBasedSecret({ secret, value, options })
  return encryptBasedOS(encryptedBySecretValue)
}

export function decryptBasedEncryptedSecret({ value, encryptedSecret, options }: TDecryptBasedEncryptedSecretParams) {
  if (!encryptedSecret) {
    return decryptBasedOS(value)
  }

  const decryptedByOSValue = decryptBasedOS(value)
  const secret = decryptBasedOS(encryptedSecret)
  return decryptBasedSecret({ secret, value: decryptedByOSValue, options })
}

function generateRandomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function setupEncryptionHandlers() {
  mainApi.listenAsync('encryptBasedOS', ({ args }) => {
    return encryptBasedOS(args)
  })

  mainApi.listenAsync('decryptBasedOS', ({ args }) => {
    return decryptBasedOS(args)
  })

  mainApi.listenSync('encryptBasedOSSync', ({ args }) => encryptBasedOS(args))

  mainApi.listenSync('decryptBasedOSSync', ({ args }) => decryptBasedOS(args))

  mainApi.listenAsync('encryptBasedSecret', ({ args }) => {
    return encryptBasedSecret(args)
  })

  mainApi.listenAsync('decryptBasedSecret', ({ args }) => {
    return decryptBasedSecret(args)
  })

  mainApi.listenAsync('encryptBasedEncryptedSecret', ({ args }) => {
    return encryptBasedEncryptedSecret(args)
  })

  mainApi.listenAsync('decryptBasedEncryptedSecret', ({ args }) => {
    return decryptBasedEncryptedSecret(args)
  })

  mainApi.listenSync('encryptBasedEncryptedSecretSync', ({ args }) => {
    return encryptBasedEncryptedSecret(args)
  })

  mainApi.listenSync('decryptBasedEncryptedSecretSync', ({ args }) => {
    return decryptBasedEncryptedSecret(args)
  })

  mainApi.listenSync('generateRandomHexSync', ({ args }) => generateRandomHex(args))
}
