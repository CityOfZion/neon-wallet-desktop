import { Separator } from '@renderer/components/Separator'

import { TFullTransactionsItem } from '@shared/types/hooks'

import { TransactionActivityListEvent } from './TransactionActivityListEvent'
import { TransactionActivityListItemHeader } from './TransactionActivityListItemHeader'

type TProps = {
  item: TFullTransactionsItem
}

export const TransactionActivityListItem = ({ item }: TProps) => {
  const { blockchain, events } = item

  return (
    <li className="flex w-full flex-col">
      <TransactionActivityListItemHeader item={item} />

      {events.length > 0 && (
        <ul className="flex w-full flex-col">
          {events.map((event, index, array) => (
            <li
              key={`${event.eventType}-${event.methodName}-${event.eventType === 'nft' ? event.collectionHash : event.contractHash}-${blockchain}-${index}`}
              className="flex h-13.25 max-h-13.25 min-h-13.25 w-full flex-col justify-center"
            >
              <TransactionActivityListEvent event={event} />

              {index !== array.length - 1 && <Separator className="h-px max-h-px min-h-px" />}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
