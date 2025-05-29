import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useTransactionActivityList } from '@renderer/hooks/useTransactionActivityList'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TContentProps = Pick<TProps, 'data'>

type TProps = {
  data: ReactNode
  label?: string
  url?: string
  className?: string
}

const Content = ({ data }: TContentProps) =>
  typeof data === 'string' || typeof data === 'number' ? (
    <TransactionActivityListTooltip data={data}>
      <span className="inline-block truncate">{data}</span>
    </TransactionActivityListTooltip>
  ) : (
    data
  )
export const TransactionActivityListEventColumn = ({ data, label, url, className }: TProps) => {
  const { eventColumnSize } = useTransactionActivityList()

  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex flex-col',
        {
          'w-24 min-w-24 max-w-24': eventColumnSize === 'xs',
          'w-28 min-w-28 max-w-28': eventColumnSize === 'sm',
          'w-32 min-w-32 max-w-32': eventColumnSize === 'md',
          'w-36 min-w-36 max-w-36': eventColumnSize === 'lg',
          'w-40 min-w-40 max-w-40': eventColumnSize === 'xl',
        },
        className
      )}
    >
      {label && <p className="font-medium text-gray-300">{label}</p>}

      {url ? (
        <Link to={url} target="_blank" className="flex text-neon">
          <Content data={data} />
        </Link>
      ) : (
        <span className="flex text-white">
          <Content data={data} />
        </span>
      )}
    </div>
  )
}
