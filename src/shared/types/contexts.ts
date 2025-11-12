import type { Dispatch, ReactNode, SetStateAction } from 'react'

export type TTransactionActivityListEventColumnSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type TTransactionActivityListProviderProps = {
  children: ReactNode
}

export type TTransactionActivityListContextValue = {
  eventColumnSize: TTransactionActivityListEventColumnSize
  setEventColumnSize: Dispatch<SetStateAction<TTransactionActivityListEventColumnSize>>
}
