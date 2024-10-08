import { useState } from 'react'

export const useLoadingActions = () => {
  const [isActing, setIsActing] = useState(false)

  const handleAct = (action: () => Promise<void> | void) => {
    return async () => {
      try {
        setIsActing(true)
        await action()
      } finally {
        setIsActing(false)
      }
    }
  }

  return {
    isActing,
    handleAct,
  }
}
