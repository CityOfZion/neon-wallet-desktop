import { useEffect, useRef, useState } from 'react'

export const useIsTruncated = <T extends HTMLElement>() => {
  const [isTruncated, setIsTruncated] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const resizeObserver = new ResizeObserver(() => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    })

    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  })

  return { ref, isTruncated }
}
