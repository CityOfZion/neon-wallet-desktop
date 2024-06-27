import { mainApi } from '@shared/api/main'
import { safeStorage } from 'electron'
import crypto from 'node:crypto'

const ALGORITHM = 'aes-192-cbc'

export const encryptBasedOS = (value: string) => {
  const buffer = safeStorage.encryptString(value)
  return buffer.toString('base64')
}

export const decryptBasedOS = (value: string) => {
  const buffer = Buffer.from(value, 'base64')
  return safeStorage.decryptString(buffer)
}

export const encryptBasedSecret = (value: string, secret: string) => {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(secret, 'salt', 24)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = cipher.update(value, 'utf8', 'hex') + cipher.final('hex')
  return iv.toString('hex') + encrypted
}

export const decryptBasedSecret = (value: string, secret: string) => {
  const iv = Buffer.from(value.slice(0, 32), 'hex')
  const key = crypto.scryptSync(secret, 'salt', 24)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  return decipher.update(value.slice(32), 'hex', 'utf8') + decipher.final('utf8')
}

export const encryptBasedEncryptedSecret = (value: string, encryptedSecret?: string) => {
  if (!encryptedSecret) {
    return encryptBasedOS(value)
  }

  const secret = decryptBasedOS(encryptedSecret)
  const encryptedBySecretValue = encryptBasedSecret(value, secret)
  return encryptBasedOS(encryptedBySecretValue)
}

export const decryptBasedEncryptedSecret = (value: string, encryptedSecret?: string) => {
  if (!encryptedSecret) {
    return decryptBasedOS(value)
  }

  const decryptedByOSValue = decryptBasedOS(value)
  const secret = decryptBasedOS(encryptedSecret)
  return decryptBasedSecret(decryptedByOSValue, secret)
}

export function registerEncryptionHandlers() {
  mainApi.listenAsync('encryptBasedOS', ({ args }) => {
    return encryptBasedOS(args)
  })

  mainApi.listenAsync('decryptBasedOS', ({ args }) => {
    return decryptBasedOS(args)
  })

  mainApi.listenAsync('encryptBasedSecret', ({ args }) => {
    return encryptBasedSecret(args.value, args.secret)
  })

  mainApi.listenAsync('decryptBasedSecret', ({ args }) => {
    return decryptBasedSecret(args.value, args.secret)
  })

  mainApi.listenAsync('encryptBasedEncryptedSecret', ({ args }) => {
    return encryptBasedEncryptedSecret(args.value, args.encryptedSecret)
  })

  mainApi.listenAsync('decryptBasedEncryptedSecret', ({ args }) => {
    return decryptBasedEncryptedSecret(args.value, args.encryptedSecret)
  })

  mainApi.listenSync('encryptBasedEncryptedSecretSync', ({ args }) => {
    return encryptBasedEncryptedSecret(args.value, args.encryptedSecret)
  })

  mainApi.listenSync('decryptBasedEncryptedSecretSync', ({ args }) => {
    return decryptBasedEncryptedSecret(args.value, args.encryptedSecret)
  })
}
