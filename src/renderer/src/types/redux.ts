import type { createSelector, Selector, UnknownMemoizer, weakMapMemoize } from 'reselect'

import type { ReduxHelper } from '@renderer/helpers/ReduxHelper'

export type TRootState = ReturnType<ReturnType<typeof ReduxHelper.getReducer>>

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
