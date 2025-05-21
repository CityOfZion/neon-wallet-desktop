import { StringHelper } from '@renderer/helpers/StringHelper'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  address: string
  addressName?: string
}

export const TransactionActivityListEventColumnDataAddress = ({ address, addressName }: TProps) => {
  let tooltipLabel = address

  if (addressName) tooltipLabel += ` (${addressName})`

  const textLabel = StringHelper.truncateString(addressName ? addressName : address, 10)

  return (
    <TransactionActivityListTooltip data={tooltipLabel}>
      <span>{textLabel}</span>
    </TransactionActivityListTooltip>
  )
}
