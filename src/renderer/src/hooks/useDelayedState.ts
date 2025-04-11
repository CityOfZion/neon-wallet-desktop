import { SetStateAction, useEffect, useRef, useState } from 'react'

type TSetStateAfter<T> = (newState: SetStateAction<T>, delay?: number) => void

type TCancelSetStateAfter = () => void

export const useDelayedState = <T = any>(initialState: T | (() => T)): [T, TSetStateAfter<T>, TCancelSetStateAfter] => {
  const [state, setState] = useState<T>(initialState)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setStateAfter: TSetStateAfter<T> = (newState: SetStateAction<T>, delay?: number) => {
    if (delay === 0 || delay === undefined) setState(newState)
    else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        setState(newState)

        timeoutRef.current = null
      }, delay)
    }
  }

  const cancelSetStateAfter: TCancelSetStateAfter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)

      timeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return [state, setStateAfter, cancelSetStateAfter]
}
