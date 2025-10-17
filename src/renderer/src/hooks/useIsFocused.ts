import { useEffect, useRef, useState } from 'react'

export const useIsFocused = <T extends HTMLElement>() => {
  const [isFocused, setIsFocused] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    element?.addEventListener('focus', handleFocus)
    element?.addEventListener('blur', handleBlur)

    return () => {
      element?.removeEventListener('focus', handleFocus)
      element?.removeEventListener('blur-sm', handleBlur)
    }
  })

  return { ref, isFocused }
}
