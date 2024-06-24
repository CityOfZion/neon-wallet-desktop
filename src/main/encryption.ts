import { ipcMain, safeStorage } from 'electron'
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
  ipcMain.handle('encryptBasedOS', async (_event, value: string) => {
    return encryptBasedOS(value)
  })

  ipcMain.handle('decryptBasedOS', async (_event, value: string) => {
    return decryptBasedOS(value)
  })

  ipcMain.handle('encryptBasedSecret', async (_event, value: string, secret: string) => {
    return encryptBasedSecret(value, secret)
  })

  ipcMain.handle('decryptBasedSecret', async (_event, value: string, secret: string) => {
    return decryptBasedSecret(value, secret)
  })

  ipcMain.handle('encryptBasedEncryptedSecret', async (_event, value: string, encryptedSecret?: string) => {
    return encryptBasedEncryptedSecret(value, encryptedSecret)
  })

  ipcMain.handle('decryptBasedEncryptedSecret', async (_event, value: string, encryptedSecret?: string) => {
    return decryptBasedEncryptedSecret(value, encryptedSecret)
  })

  ipcMain.on('encryptBasedEncryptedSecretSync', async (event, value: string, encryptedSecret?: string) => {
    event.returnValue = encryptBasedEncryptedSecret(value, encryptedSecret)
  })

  ipcMain.on('decryptBasedEncryptedSecretSync', async (event, value: string, encryptedSecret?: string) => {
    event.returnValue = decryptBasedEncryptedSecret(value, encryptedSecret)
  })
}
