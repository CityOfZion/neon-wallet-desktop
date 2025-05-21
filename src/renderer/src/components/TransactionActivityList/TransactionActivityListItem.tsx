import { Separator } from '@renderer/components/Separator'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useMigrationNeo3Selector } from '@renderer/hooks/useUtilitySelector'
import { thunks } from '@renderer/store/thunks'
import { TFullTransactionsItem } from '@shared/@types/hooks'

import { TransactionActivityListEvent } from './TransactionActivityListEvent'
import { TransactionActivityListItemHeader } from './TransactionActivityListItemHeader'

type TProps = {
  item: TFullTransactionsItem
}

export const TransactionActivityListItem = ({ item }: TProps) => {
  const { txId, blockchain, events } = item

  const { migrationNeo3 } = useMigrationNeo3Selector(txId)
  const dispatch = useAppDispatch()

  // TODO: remove this when we resolve this issue (https://app.clickup.com/t/86a82109t)
  useMountUnsafe(() => {
    if (migrationNeo3 && migrationNeo3.status === 'pending')
      dispatch(thunks.waitMigration({ ...migrationNeo3, status: 'failure-neo3' }))
  })

  return (
    <li className="w-full flex flex-col">
      <TransactionActivityListItemHeader item={item} migrationNeo3={migrationNeo3} />

      {events.length > 0 && (
        <ul className="flex flex-col w-full">
          {events.map((event, index, array) => (
            <li
              key={`${event.eventType}-${event.methodName}-${event.hash}-${blockchain}-${index}`}
              className="w-full flex flex-col justify-center h-[3.3125rem] min-h-[3.3125rem] max-h-[3.3125rem]"
            >
              <TransactionActivityListEvent event={event} />

              {index !== array.length - 1 && <Separator className="h-px min-h-px max-h-px" />}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
