import { useEffect, useRef, useState } from 'react'

export const useOutsideClick = <T extends HTMLElement>() => {
  const [isOutsideClick, setIsOutsideClick] = useState<boolean>(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    const handleFocus = () => {
      setIsOutsideClick(true)
    }

    const handleBlur = () => {
      setIsOutsideClick(false)
    }

    element?.addEventListener('focus', handleFocus)
    element?.addEventListener('blur', handleBlur)

    return () => {
      element?.removeEventListener('focus', handleFocus)
      element?.removeEventListener('blur', handleBlur)
    }
  })

  return { ref, isOutsideClick }
}
