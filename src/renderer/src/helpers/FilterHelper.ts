type TFilterTextByFieldsOptions = {
  inverseMatch?: boolean
}

export class FilterHelper {
  static filterTextByFields<T>(
    list: T[],
    text: string,
    fields: string[],
    options: TFilterTextByFieldsOptions = {}
  ): T[] {
    const { inverseMatch = false } = options

    text = text.toLowerCase().trim()

    if (!text) return [...list]

    const splitText = text.split(/\s+/)

    return list.filter(item =>
      splitText.every(text =>
        fields.some(field => {
          const fieldValue: string | undefined = item[field]?.toLowerCase()?.trim()

          return !!fieldValue?.includes(text) || (inverseMatch && !!fieldValue && text.includes(fieldValue))
        })
      )
    )
  }
}
