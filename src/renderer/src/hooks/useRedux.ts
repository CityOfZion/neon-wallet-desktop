import type { MutableRefObject } from 'react'
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootStore } from '@renderer/store/RootStore'
import { createSelector, Selector, UnknownMemoizer, weakMapMemoize } from 'reselect'

export type TRootState = ReturnType<typeof RootStore.reducers>

type TTypedCreateSelector<
  State,
  MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
> = <
  InputSelectors extends readonly Selector<State>[],
  Result,
  OverrideMemoizeFunction extends UnknownMemoizer = MemoizeFunction,
  OverrideArgsMemoizeFunction extends UnknownMemoizer = ArgsMemoizeFunction,
>(
  ...createSelectorArgs: Parameters<
    typeof createSelector<InputSelectors, Result, OverrideMemoizeFunction, OverrideArgsMemoizeFunction>
  >
) => ReturnType<typeof createSelector<InputSelectors, Result, OverrideMemoizeFunction, OverrideArgsMemoizeFunction>>

export const useAppDispatch: () => typeof RootStore.store.dispatch = useDispatch

export function useAppSelector<T = unknown>(
  selectHandler: (state: TRootState) => T
): { value: T; ref: MutableRefObject<T> } {
  const ref = useRef<T>() as MutableRefObject<T>

  const value = useSelector((state: TRootState) => {
    const result = selectHandler(state)
    ref.current = result
    return result
  })

  return { value, ref }
}

export const createAppSelector: TTypedCreateSelector<TRootState> = createSelector
