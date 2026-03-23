import { createContext, useState } from 'react'

import {
  TTransactionActivityListContextValue,
  TTransactionActivityListItemColumnSize,
  TTransactionActivityListProviderProps,
} from '@shared/types/contexts'

export const TransactionActivityListContext = createContext<TTransactionActivityListContextValue>(
  {} as TTransactionActivityListContextValue
)

export const TransactionActivityListProvider = ({ children }: TTransactionActivityListProviderProps) => {
  const [itemColumnSize, setItemColumnSize] = useState<TTransactionActivityListItemColumnSize>('xs')

  return (
    <TransactionActivityListContext.Provider value={{ itemColumnSize, setItemColumnSize }}>
      {children}
    </TransactionActivityListContext.Provider>
  )
}
