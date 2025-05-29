import { useContext } from 'react'
import { TransactionActivityListContext } from '@renderer/contexts/TransactionActivityListContext'

export const useTransactionActivityList = () => useContext(TransactionActivityListContext)
