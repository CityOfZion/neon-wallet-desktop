import { getI18n } from 'react-i18next'
import { AVAILABLE_RANDOM_COLORS, MANDATORY_TOKEN_COLORS } from '@renderer/constants/colors'
import _ from 'lodash'
import * as uuid from 'uuid'

import { DateHelper } from './DateHelper'
import { ToastHelper } from './ToastHelper'

export type TImageSize = {
  width: number
  height: number
}

export class UtilsHelper {
  static getRandomNumber(max: number) {
    return Math.floor(Math.random() * Math.floor(max))
  }

  static randomLower() {
    let result = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
  }

  static randomUpper() {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
  }

  static randomSymbol() {
    let result = ''
    const characters = '!@#$%^&*()_+[\\]{};\':"\\|,.<>/?'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
      counter += 1
    }
    return result
  }

  static generateStrongPassword() {
    const passwordLength = 15
    let password = this.getRandomNumber(9).toString() + this.randomSymbol() + this.randomUpper() + this.randomLower()
    for (let i = 0; i < passwordLength; i++) {
      const choice = this.getRandomNumber(4)
      if (choice === 0) {
        password += this.randomLower()
      } else if (choice === 1) {
        password += this.randomUpper()
      } else if (choice === 2) {
        password += this.randomSymbol()
      } else if (choice === 3) {
        password += this.getRandomNumber(9).toString()
      } else {
        i--
      }
    }

    return _.shuffle(password).join('')
  }

  static async promiseAll<T, R>(array: T[], callback: (item: T) => Promise<R> | R): Promise<R[]> {
    const results: R[] = []
    const promises = array.map(async item => {
      try {
        const result = await callback(item)
        results.push(result)
      } catch {
        /* empty */
      }
    })
    await Promise.all(promises)
    return results
  }

  static orderBy<T>(array: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc') {
    return array.sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      if (aValue === bValue) {
        return 0
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1
      }

      return aValue < bValue ? 1 : -1
    })
  }

  static copyToClipboard(text: string) {
    const { t } = getI18n()
    ToastHelper.success({ message: t('common:general.successfullyCopied') })
    navigator.clipboard.writeText(text)
  }

  static uuid() {
    return uuid.v4()
  }

  static isValidMnemonic(word: string | string[]) {
    const wordArray = Array.isArray(word) ? word : word.trim().split(' ')
    return wordArray.length === 12
  }

  static isMnemonic(word: string | string[]) {
    const wordArray = Array.isArray(word) ? word : word.trim().split(' ')
    return wordArray.length > 1
  }

  static donwloadSVGToPng(elementId: string, suggestedFileName?: string) {
    const svg = document.getElementById(elementId)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()

    const dateString = DateHelper.getCurrentFullDateString()
    const fileName = suggestedFileName || `Neon3_QRCode_${dateString}.png`

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = fileName
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  static normalizeHash(hash: string) {
    return hash.replace('0x', '').toLowerCase()
  }

  static generateTokenColor(hash: string) {
    if (hash.length === 0) throw new Error('Invalid hash')

    const normalizedHash = this.normalizeHash(hash)

    if (MANDATORY_TOKEN_COLORS[normalizedHash]) return MANDATORY_TOKEN_COLORS[normalizedHash]

    let sum = 0
    for (let i = 0; i < hash.length; i++) {
      sum += hash.charCodeAt(i)
    }

    const randomColorIndex = sum % AVAILABLE_RANDOM_COLORS.length
    return AVAILABLE_RANDOM_COLORS[randomColorIndex]
  }

  static sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static getImageSize(url: string) {
    return new Promise<TImageSize>((resolve, reject) => {
      if (!url) {
        throw new Error('Invalid URL')
      }

      const img = new Image()

      img.addEventListener('load', () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      })

      img.addEventListener('error', event => {
        reject(`${event.type}: ${event.message}`)
      })

      img.src = url
    })
  }
}
