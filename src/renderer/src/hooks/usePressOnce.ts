import { useRef, useState } from 'react'

type TCallback<T extends any[] = any[]> = (...args: T) => void | Promise<void>

export function usePressOnce(): [boolean, <T extends any[]>(callback: TCallback<T>) => (...args: T) => void]
export function usePressOnce<T extends any[]>(rootCallback: TCallback<T>): [boolean, (...args: T) => void]
export function usePressOnce<T extends any[] = any[]>(rootCallback?: TCallback<T>): any {
  const isPressingRef = useRef(false)
  const [isPressing, setIsPressing] = useState<boolean>(false)

  const handlePress = <A extends any[] = T>(rootArgs?: TCallback<A> | A) => {
    const process = async (callback: TCallback<any>, ...callbackArgs: any[]) => {
      if (isPressingRef.current) return

      isPressingRef.current = true
      setIsPressing(true)

      try {
        await callback(...(callbackArgs as unknown as A))
      } finally {
        isPressingRef.current = false
        setIsPressing(false)
      }
    }

    if (rootCallback) {
      return process(rootCallback, rootArgs)
    }

    return (...args: A) => {
      return process(rootArgs as TCallback<A>, args)
    }
  }

  return [isPressing, handlePress] as const
}
