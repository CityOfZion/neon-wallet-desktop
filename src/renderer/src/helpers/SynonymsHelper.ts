import { getI18next } from '@shared/libs/i18next'

export class SynonymsHelper {
  static #synonymsMap = new Map<string, string[]>()

  static getSynonyms(word: string) {
    const { t } = getI18next()
    if (this.#synonymsMap.has(word)) {
      return this.#synonymsMap.get(word)!
    }

    try {
      // @ts-expect-error Word is a string and the typescript does not recognize it
      const synonyms = t(`common:synonyms.${word}`, { returnObjects: true }) as string[]
      this.#synonymsMap.set(word, synonyms)
    } catch (error) {
      this.#synonymsMap.set(word, [])
    }

    return this.#synonymsMap.get(word)!
  }

  static async getAllSynonyms(keywords: string[]) {
    const allTerms = new Set<string>()

    await Promise.allSettled(
      keywords.map(async keyword => {
        const synonyms = this.getSynonyms(keyword)
        synonyms.forEach(term => allTerms.add(term))
      })
    )

    return Array.from(allTerms)
  }
}
