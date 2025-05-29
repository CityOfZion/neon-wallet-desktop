import { StringHelper } from '@renderer/helpers/StringHelper'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  address: string
  addressName?: string
}

export const TransactionActivityListEventColumnDataAddress = ({ address, addressName }: TProps) => {
  let tooltipLabel = address

  if (addressName) tooltipLabel += ` (${addressName})`

  const textLabel = addressName
    ? StringHelper.truncateString(addressName, 10)
    : StringHelper.truncateStringMiddle(address, 8)

  return (
    <TransactionActivityListTooltip data={tooltipLabel}>
      <span className="inline-block">{textLabel}</span>
    </TransactionActivityListTooltip>
  )
}
