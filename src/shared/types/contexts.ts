import type { Dispatch, ReactNode, SetStateAction } from 'react'

export type TTransactionActivityListItemColumnSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type TTransactionActivityListProviderProps = {
  children: ReactNode
}

export type TTransactionActivityListContextValue = {
  itemColumnSize: TTransactionActivityListItemColumnSize
  setItemColumnSize: Dispatch<SetStateAction<TTransactionActivityListItemColumnSize>>
}
