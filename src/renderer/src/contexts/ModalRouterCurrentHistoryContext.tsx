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
  isFocused,
  children,
  index,
}: TModalRouterCurrentHistoryProviderProps) => {
  return (
    <ModalRouterCurrentHistoryContext.Provider value={{ history, isFocused, index }}>
      <FocusScope loop trapped role="dialog" aria-modal="true" className="absolute top-0 left-0 h-full w-full">
        {children}
      </FocusScope>
    </ModalRouterCurrentHistoryContext.Provider>
  )
}
