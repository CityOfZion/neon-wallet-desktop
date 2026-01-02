import { TranslationServiceClient } from '@google-cloud/translate'
import isEqual from 'lodash/isEqual'
import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const CLIENT = new TranslationServiceClient()

const LOCALE_DIR_PATH = path.join(process.cwd(), 'src', 'shared', 'locales')
const MAIN_LOCALE = 'en'
const MAIN_PATH = path.join(LOCALE_DIR_PATH, MAIN_LOCALE)
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID!
const LOCATION = 'global'

async function treatError(message: string, code = 1): Promise<never> {
  const othersLocales = await getOtherLocales()

  // Revert changes in other locale directories
  for (const locale of othersLocales) {
    const localePath = path.join(LOCALE_DIR_PATH, locale)
    execSync(`git restore ${localePath}`, { stdio: 'inherit' })
  }

  console.error(message)
  return process.exit(code)
}

async function getOtherLocales() {
  return (await fs.readdir(LOCALE_DIR_PATH, { withFileTypes: true }))
    .filter(value => value.isDirectory() && value.name !== MAIN_LOCALE)
    .map(value => value.name)
}

async function getNamespaces() {
  return (await fs.readdir(MAIN_PATH, { withFileTypes: true }))
    .filter(value => value.isFile() && value.name.endsWith('.json'))
    .map(value => value.name)
}

export async function translateText(text: string, targetLanguageCode: string): Promise<string> {
  if (!text?.trim()) return text

  const request = {
    parent: `projects/${GCP_PROJECT_ID}/locations/${LOCATION}`,
    contents: [text],
    mimeType: 'text/plain',
    targetLanguageCode,
  }

  const [response] = await CLIENT.translateText(request)

  return response.translations?.[0]?.translatedText ?? text
}

function findDifferences(newFile: Map<string, any>, oldFile: Map<string, any>) {
  const removedKeys = new Set<string>()
  const updatedKeys = new Map<string, string>()

  for (const [key, newValue] of newFile.entries()) {
    if (!oldFile.has(key)) {
      updatedKeys.set(key, newValue)
      continue
    }

    const oldValue = oldFile.get(key)
    if (!isEqual(newValue, oldValue)) {
      updatedKeys.set(key, newValue)
    }
  }

  for (const key of oldFile.keys()) {
    if (!newFile.has(key)) {
      removedKeys.add(key)
    }
  }

  return {
    removedKeys,
    updatedKeys,
  }
}

function flattenObjectToMap(obj: Record<string, any>, prefix = '', result = new Map<string, any>()): Map<string, any> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (Array.isArray(value)) {
        // Handle arrays by indexing each element
        value.forEach((item, index) => {
          const arrayKey = `${newKey}.${index}`
          if (typeof item === 'object' && item !== null) {
            flattenObjectToMap(item, arrayKey, result)
          } else {
            result.set(arrayKey, item)
          }
        })
      } else if (typeof value === 'object' && value !== null) {
        flattenObjectToMap(value, newKey, result)
      } else {
        result.set(newKey, value)
      }
    }
  }
  return result
}

function unflattenMapToObject(map: Map<string, any>): Record<string, any> {
  const obj = {} as Record<string, any>

  map.forEach((value, key) => {
    const keys = key.split('.')
    let current = obj

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      const isLast = i === keys.length - 1

      // Check if the next key is a number to determine if we need an array
      const nextKey = keys[i + 1]
      const shouldBeArray = nextKey !== undefined && /^\d+$/.test(nextKey)

      if (isLast) {
        current[k] = value
      } else {
        if (!current[k]) {
          // Create array if next key is numeric, otherwise create object
          current[k] = shouldBeArray ? [] : {}
        }
        current = current[k]
      }
    }
  })

  return obj
}

async function getPreviousNamespaceMap(namespacePath: string) {
  let currentNamespaceMap = new Map<string, any>()

  try {
    const relativeFilePath = path.relative(process.cwd(), namespacePath)
    const oldFileContent = execSync(`git show HEAD:${relativeFilePath}`, { encoding: 'utf-8', stdio: 'pipe' })
    currentNamespaceMap = flattenObjectToMap(JSON.parse(oldFileContent))
  } catch {
    console.warn(`Could not find previous version of ${path.basename(namespacePath)} in git. Assuming it's a new file.`)
  }

  return currentNamespaceMap
}

async function getCurrentNamespaceMap(namespacePath: string) {
  const fileContent = await fs.readFile(namespacePath, 'utf-8')
  return flattenObjectToMap(JSON.parse(fileContent))
}

async function main() {
  if (!GCP_PROJECT_ID) {
    return await treatError('Missing GCP_PROJECT_ID in environment variables.', 0)
  }

  const otherLocales = await getOtherLocales()

  // Ensure there are no uncommitted changes in other locale directories
  for (const locale of otherLocales) {
    const localePath = path.join(LOCALE_DIR_PATH, locale)
    const gitStatus = execSync(`git status --porcelain ${localePath}`, { encoding: 'utf-8' })
    if (gitStatus.trim() !== '') {
      return await treatError(
        'Detected uncommitted changes in other locale directories. Skipping translation to avoid overwriting them.',
        0
      )
    }
  }

  const namespaces = await getNamespaces()

  try {
    for (const namespace of namespaces) {
      const mainNamespacePath = path.join(MAIN_PATH, namespace)

      const previousMainNamespaceMap = await getPreviousNamespaceMap(mainNamespacePath)
      const previousMainNamespaceKeys = new Set(previousMainNamespaceMap.keys())

      const newMainNamespaceMap = await getCurrentNamespaceMap(mainNamespacePath)

      const { removedKeys, updatedKeys } = findDifferences(newMainNamespaceMap, previousMainNamespaceMap)

      for (const otherLocale of otherLocales) {
        const otherLocaleNamespacePath = path.join(LOCALE_DIR_PATH, otherLocale, namespace)
        const otherLocaleNamespaceFileMap = await getCurrentNamespaceMap(otherLocaleNamespacePath)
        const otherLocaleNamespaceKeys = new Set(otherLocaleNamespaceFileMap.keys())

        const difference = previousMainNamespaceKeys.symmetricDifference(otherLocaleNamespaceKeys)

        if (difference.size > 0) {
          return await treatError(
            `"${otherLocale}/${namespace}" has been modified outside of the "${MAIN_LOCALE}" locale. Please revert changes in this file so it can be automatically updated.`,
            1
          )
        }

        if (removedKeys.size === 0 && updatedKeys.size === 0) {
          continue
        }

        for (const removedKey of removedKeys) {
          otherLocaleNamespaceFileMap.delete(removedKey)
        }

        for (const [addedKey, addedValue] of updatedKeys) {
          const translatedText = await translateText(addedValue, otherLocale)
          otherLocaleNamespaceFileMap.set(addedKey, translatedText)
        }

        const updatedLocaleObject = unflattenMapToObject(otherLocaleNamespaceFileMap)
        await fs.writeFile(otherLocaleNamespacePath, JSON.stringify(updatedLocaleObject, null, 2), 'utf-8')
        console.log(`${otherLocale}/${namespace} updated successfully.`)
      }
    }
  } catch (error: any) {
    await treatError(`Translation process failed: ${error.message}`)
  }
}

main()
