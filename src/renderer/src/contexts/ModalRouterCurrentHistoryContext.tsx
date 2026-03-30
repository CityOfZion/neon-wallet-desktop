import { createContext } from 'react'

import type {
  TModalRouterCurrentHistoryContextValue,
  TModalRouterCurrentHistoryProviderProps,
} from '@shared/types/modal'

export const ModalRouterCurrentHistoryContext = createContext<TModalRouterCurrentHistoryContextValue>(
  {} as TModalRouterCurrentHistoryContextValue
)

export const ModalRouterCurrentHistoryProvider = ({
  history,
  children,
  groupIndex,
  isFocused,
  isGroupFocused,
}: TModalRouterCurrentHistoryProviderProps) => {
  return (
    <ModalRouterCurrentHistoryContext.Provider value={{ history, isFocused, isGroupFocused, groupIndex }}>
      <div
        role="dialog"
        aria-modal={isGroupFocused}
        aria-hidden={!isGroupFocused}
        inert={!isFocused || undefined}
        className="absolute top-0 left-0 h-full w-full"
      >
        {children}
      </div>
    </ModalRouterCurrentHistoryContext.Provider>
  )
}
