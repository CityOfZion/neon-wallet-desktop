import { DependencyList, useEffect, useRef, useState } from 'react'

type TEffect = () => void | Promise<void> | (() => void | Promise<void>)

export const useMount = (effect: TEffect, changingStateVars?: DependencyList, delay: number = 500) => {
  const [isMounting, setIsMounting] = useState(true)

  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setIsMounting(true)
    let destroyCallback: ReturnType<TEffect> | undefined

    timeoutRef.current = setTimeout(async () => {
      try {
        destroyCallback = await effect()
      } finally {
        setIsMounting(false)
      }
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current)

      if (destroyCallback && typeof destroyCallback === 'function') {
        destroyCallback()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, changingStateVars)

  return { isMounting }
}

export const useMountUnsafe = (effect: TEffect, delay: number = 0) => {
  const [isMounting, setIsMounting] = useState(true)

  const numberOfRender = useRef(0)
  const unmountEffectRef = useRef<ReturnType<TEffect>>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    numberOfRender.current += 1

    // StrictMode make the effect to run twice and we want to run the effect only once on the first render
    if (numberOfRender.current <= 1) {
      timeoutRef.current = setTimeout(async () => {
        try {
          unmountEffectRef.current = effect()
        } finally {
          setIsMounting(false)
        }
      }, delay)
    }

    return () => {
      // StrictMode make the effect to run twice and we don't want to unmount the effect on the first render because it's not the real unmount
      if (numberOfRender.current > 1) {
        clearTimeout(timeoutRef.current)

        if (unmountEffectRef.current && typeof unmountEffectRef.current === 'function') {
          unmountEffectRef.current()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    isMounting,
  }
}
