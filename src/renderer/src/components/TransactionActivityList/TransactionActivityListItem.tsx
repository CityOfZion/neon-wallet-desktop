import { Separator } from '@renderer/components/Separator'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListEvent } from './TransactionActivityListEvent'
import { TransactionActivityListItemHeader } from './TransactionActivityListItemHeader'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const TransactionActivityListItem = ({ transaction }: TProps) => {
  return (
    <li className="flex w-full flex-col">
      <TransactionActivityListItemHeader transaction={transaction} />

      {/* TODO: change component names on UTXO task */}
      {transaction.view === 'default' && (
        <ul className="flex w-full flex-col">
          {transaction.events.map((event, index, array) => {
            const hash = event.eventType === 'nft' ? event.nft?.hash : event.token?.hash

            return (
              <li
                key={`${event.eventType}-${hash}-${event.methodName}-${transaction.blockchain}-${index}`}
                className="flex h-13.25 max-h-13.25 min-h-13.25 w-full flex-col justify-center"
              >
                <TransactionActivityListEvent event={event} />

                {index !== array.length - 1 && <Separator className="h-px max-h-px min-h-px" />}
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
