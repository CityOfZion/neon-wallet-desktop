import type { createSelector, Selector, UnknownMemoizer, weakMapMemoize } from 'reselect'

import type { getReducer } from '@renderer/libs/redux'

export type TRootState = ReturnType<ReturnType<typeof getReducer>>

export type TTypedCreateSelector<
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
