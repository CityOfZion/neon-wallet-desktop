import { createContext, useState } from 'react'
import {
  TTransactionActivityListContextValue,
  TTransactionActivityListEventColumnSize,
  TTransactionActivityListProviderProps,
} from '@shared/@types/modal'

export const TransactionActivityListContext = createContext<TTransactionActivityListContextValue>(
  {} as TTransactionActivityListContextValue
)

export const TransactionActivityListProvider = ({ children }: TTransactionActivityListProviderProps) => {
  const [eventColumnSize, setEventColumnSize] = useState<TTransactionActivityListEventColumnSize>('xs')

  return (
    <TransactionActivityListContext.Provider value={{ eventColumnSize, setEventColumnSize }}>
      {children}
    </TransactionActivityListContext.Provider>
  )
}
