import type { MutableRefObject } from 'react'
import { useRef } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { RootStore } from '@renderer/store/RootStore'

export const useAppDispatch: () => typeof RootStore.store.dispatch = useDispatch

export function useAppSelector<T = unknown>(
  selectHandler: (state: ReturnType<typeof RootStore.reducers>) => T
): { value: T; ref: MutableRefObject<T> } {
  const value = useSelector(selectHandler)

  const ref = useRef<T>(value)

  useSelector(selectHandler, (old, next) => {
    ref.current = next
    return shallowEqual(old, next)
  })

  return { value, ref: ref as MutableRefObject<T> }
}
