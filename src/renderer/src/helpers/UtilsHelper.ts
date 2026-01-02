import * as uuid from 'uuid'

import { DateHelper } from './DateHelper'

export class UtilsHelper {
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

  static uuid() {
    return uuid.v4()
  }

  static downloadSVGToPng(elementId: string, suggestedFileName?: string) {
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
      downloadLink.href = pngFile
      downloadLink.click()

      canvas.remove()
      downloadLink.remove()
      img.remove()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  static getImageSize(url: string) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
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

  static validateURL(text: string) {
    try {
      const url = new URL(text)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      /* empty */
    }

    return false
  }

  static parseJsonSafely(value: any): any {
    if (typeof value !== 'string') return value

    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
}
