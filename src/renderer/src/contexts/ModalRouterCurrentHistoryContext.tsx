import { createContext } from 'react'

import { FocusScope } from '@radix-ui/react-focus-scope'

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
      <FocusScope
        loop
        trapped
        role="dialog"
        aria-modal={isGroupFocused}
        aria-hidden={!isGroupFocused}
        inert={!isFocused || undefined}
        className="absolute top-0 left-0 h-full w-full"
      >
        {children}
      </FocusScope>
    </ModalRouterCurrentHistoryContext.Provider>
  )
}
