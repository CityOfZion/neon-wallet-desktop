import { DependencyList, EffectCallback, useEffect, useRef, useState } from 'react'

export const useMount = (
  effect: () => void | Promise<void>,
  changingStateVars?: DependencyList,
  delay: number = 500
) => {
  const [isMounting, setIsMounting] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setIsMounting(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        await effect()
      } finally {
        setIsMounting(false)
      }
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, changingStateVars)

  return { isMounting }
}

export const useMountUnsafe = (effect: EffectCallback) => {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return

    initialized.current = true
    return effect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
