import { useMemo } from 'react'

export function useTheme(...propertyNames: string[]) {
  return useMemo(() => {
    const root = getComputedStyle(document.documentElement)

    return propertyNames.map(propertyName => root.getPropertyValue(`--${propertyName}`).trim())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyNames.join(',')])
}
