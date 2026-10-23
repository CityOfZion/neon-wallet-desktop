import { useEffect, useState } from 'react'

export const useIsTruncated = <T extends HTMLElement>() => {
  const [element, setElement] = useState<T | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    if (!element) {
      setIsTruncated(false)
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    })

    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [element])

  return { ref: setElement, isTruncated }
}
