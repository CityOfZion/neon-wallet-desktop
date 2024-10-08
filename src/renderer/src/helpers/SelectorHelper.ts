const EMPTY_ARRAY: [] = []

export class SelectorHelper {
  static fallbackToEmptyArray = <T>(array: T[] | undefined) => {
    return !array || array.length === 0 ? EMPTY_ARRAY : array
  }
}
