import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListItemsDefault } from './TransactionActivityListItemsDefault'
import { TransactionActivityListItemsHeader } from './TransactionActivityListItemsHeader'
import { TransactionActivityListItemsUtxo } from './TransactionActivityListItemsUtxo'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const TransactionActivityListItems = ({ transaction }: TProps) => (
  <li className="flex w-full flex-col">
    <TransactionActivityListItemsHeader transaction={transaction} />

    {transaction.view === 'utxo' ? (
      <TransactionActivityListItemsUtxo transaction={transaction} />
    ) : (
      <TransactionActivityListItemsDefault transaction={transaction} />
    )}
  </li>
)
