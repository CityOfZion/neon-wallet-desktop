import { useRef, useState } from 'react'

export const usePressOnce = () => {
  const [isPressing, setIsPressing] = useState(false)
  const isPressingRef = useRef(false)

  const handlePressOnce = (callback: (() => void) | (() => Promise<void>)) => async () => {
    if (isPressing || isPressingRef.current) return

    setIsPressing(true)
    isPressingRef.current = true

    try {
      await callback()
    } catch (error) {
      console.error(error)
    } finally {
      setIsPressing(false)
      isPressingRef.current = false
    }
  }

  return { isPressing, isPressingRef, handlePressOnce }
}
