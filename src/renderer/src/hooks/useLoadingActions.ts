import { useState } from 'react'

export const useLoadingActions = (onAct: () => Promise<void> | void) => {
  const [isActing, setIsActing] = useState(false)

  const handleAct = async () => {
    try {
      setIsActing(true)
      await onAct()
    } finally {
      setIsActing(false)
    }
  }

  return {
    isActing,
    handleAct,
  }
}
