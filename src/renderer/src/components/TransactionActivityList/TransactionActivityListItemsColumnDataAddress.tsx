import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  address: string
  accountName?: string
  addressMaxLength?: number
  accountNameMaxLength?: number
  className?: string
}

export const TransactionActivityListItemsColumnDataAddress = ({
  address,
  accountName,
  addressMaxLength,
  accountNameMaxLength,
  className,
}: TProps) => {
  let tooltipLabel = address

  if (accountName) tooltipLabel += ` (${accountName})`

  const textLabel = accountName
    ? StringHelper.truncate(accountName, accountNameMaxLength || 10)
    : StringHelper.truncateMiddle(address, addressMaxLength || 8)

  return (
    <TransactionActivityListTooltip data={tooltipLabel}>
      <span className={StyleHelper.mergeStyles('inline-block', className)}>{textLabel}</span>
    </TransactionActivityListTooltip>
  )
}
