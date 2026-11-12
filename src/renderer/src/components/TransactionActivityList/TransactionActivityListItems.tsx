import { memo } from 'react'

import type { TSwapApiOrderSummary } from '@cityofzion/bs-multichain'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListItemsDefault } from './TransactionActivityListItemsDefault'
import { TransactionActivityListItemsHeader } from './TransactionActivityListItemsHeader'
import { TransactionActivityListItemsUtxo } from './TransactionActivityListItemsUtxo'

type TProps = {
  transaction: TUseTransactionsTransaction
  swapOrders: TSwapApiOrderSummary[]
}

export const TransactionActivityListItems = memo(
  ({ transaction, swapOrders }: TProps) => {
    return (
      <li className="flex w-full flex-col">
        <TransactionActivityListItemsHeader transaction={transaction} swapOrders={swapOrders} />

        {transaction.view === 'utxo' ? (
          <TransactionActivityListItemsUtxo transaction={transaction} />
        ) : (
          <TransactionActivityListItemsDefault transaction={transaction} />
        )}
      </li>
    )
  },
  (prev, next) => prev.transaction.txId === next.transaction.txId
)
