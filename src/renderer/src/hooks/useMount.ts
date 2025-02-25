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
  const numberOfRender = useRef(0)
  const unmountEffectRef = useRef<ReturnType<EffectCallback>>()

  useEffect(() => {
    numberOfRender.current += 1

    // StrictMode make the effect to run twice and we want to run the effect only once on the first render
    if (numberOfRender.current <= 1) {
      unmountEffectRef.current = effect()
    }

    return () => {
      // StrictMode make the effect to run twice and we don't want to unmount the effect on the first render because it's not the real unmount
      if (numberOfRender.current > 1 && unmountEffectRef.current) {
        unmountEffectRef.current()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
