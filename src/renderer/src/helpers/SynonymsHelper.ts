import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

export class SynonymsHelper {
  static readonly #synonymsMap = new Map<string, string[]>()

  static getSynonyms(word: string) {
    const { t } = SharedI18nextHelper.get()
    if (this.#synonymsMap.has(word)) {
      return this.#synonymsMap.get(word)!
    }

    try {
      // @ts-expect-error Word is a string and the typescript does not recognize it
      const synonyms = t(`common:synonyms.${word}`, { returnObjects: true }) as string[]
      this.#synonymsMap.set(word, synonyms)
    } catch {
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
