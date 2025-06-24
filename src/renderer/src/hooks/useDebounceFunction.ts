import { useRef } from 'react'

export const useDebounceFunction = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFunction = <T extends (...args: any[]) => void>(callback: T, delay = 1500) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      callback()
      timeoutRef.current = null
    }, delay)
  }

  return debouncedFunction
}
