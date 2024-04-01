import { createContext } from 'react'
import { TModalRouterCurrentHistoryContextValue, TModalRouterCurrentHistoryProviderProps } from '@renderer/@types/modal'

export const ModalRouterCurrentHistoryContext = createContext<TModalRouterCurrentHistoryContextValue>(
  {} as TModalRouterCurrentHistoryContextValue
)

export const ModalRouterCurrentHistoryProvider = ({ value, children }: TModalRouterCurrentHistoryProviderProps) => {
  return (
    <ModalRouterCurrentHistoryContext.Provider value={{ value }}>{children}</ModalRouterCurrentHistoryContext.Provider>
  )
}
