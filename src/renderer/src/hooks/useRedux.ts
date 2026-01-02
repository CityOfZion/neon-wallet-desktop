import { type RefObject, useRef } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import type { ReduxHelper } from '@renderer/helpers/ReduxHelper'

import type { TRootState, TTypedCreateSelector } from '@renderer/types/redux'

export const useAppDispatch: () => typeof ReduxHelper.store.dispatch = useDispatch

export function useAppSelector<T = unknown>(selectHandler: (state: TRootState) => T): { value: T; ref: RefObject<T> } {
  const ref = useRef<T>(undefined) as RefObject<T>

  const value = useSelector((state: TRootState) => {
    const result = selectHandler(state)
    ref.current = result
    return result
  })

  return { value, ref }
}

export const createAppSelector: TTypedCreateSelector<TRootState> = createSelector
