import { useRef } from 'react'

export const useInfiniteScroll = <T extends HTMLElement>(fetchCallback: (...params: any[]) => Promise<any> | any) => {
  const ref = useRef<T>(null)
  const shouldFetch = useRef(true)

  const handleScroll = async () => {
    const element = ref.current
    if (!element) return

    const { scrollTop, clientHeight, scrollHeight } = element
    const calc = scrollHeight - scrollTop - clientHeight

    if (calc > 400) {
      shouldFetch.current = true
    } else {
      if (!shouldFetch.current) return
      shouldFetch.current = false
      fetchCallback()
    }
  }

  return { handleScroll, ref }
}
