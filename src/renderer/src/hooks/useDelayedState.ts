import { SetStateAction, useEffect, useRef, useState } from 'react'

type TSetStateAfter<T> = (newState: SetStateAction<T>, delay?: number) => void

type TCancelSetStateAfter = () => void

type TOptions = {
  shouldCancelBeforeSet?: boolean
}

export const useDelayedState = <T = any>(
  initialState: T | (() => T),
  options: TOptions = {}
): [T, TSetStateAfter<T>, TCancelSetStateAfter] => {
  const { shouldCancelBeforeSet = true } = options

  const [state, setState] = useState<T>(initialState)
  const lastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setStateAfter: TSetStateAfter<T> = (newState: SetStateAction<T>, delay?: number) => {
    if (delay === 0 || delay === undefined) setState(newState)
    else {
      if (shouldCancelBeforeSet) cancelSetStateAfter()

      lastTimeoutRef.current = setTimeout(() => {
        setState(newState)

        lastTimeoutRef.current = null
      }, delay)
    }
  }

  const cancelSetStateAfter: TCancelSetStateAfter = () => {
    if (lastTimeoutRef.current) {
      clearTimeout(lastTimeoutRef.current)

      lastTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (lastTimeoutRef.current) clearTimeout(lastTimeoutRef.current)
    }
  }, [])

  return [state, setStateAfter, cancelSetStateAfter]
}
