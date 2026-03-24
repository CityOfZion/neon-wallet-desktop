import { ReactNode } from 'react'

import { Link } from 'react-router'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useTransactionActivityList } from '@renderer/hooks/useTransactionActivityList'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TContentProps = Pick<TProps, 'data'>

type TProps = {
  data: ReactNode
  label?: string
  url?: string
  className?: string
  labelClassName?: string
}

const Content = ({ data }: TContentProps) =>
  typeof data === 'string' || typeof data === 'number' ? (
    <TransactionActivityListTooltip data={data}>
      <span className="inline-block truncate">{data}</span>
    </TransactionActivityListTooltip>
  ) : (
    data
  )

export const TransactionActivityListItemsColumn = ({ data, label, url, className, labelClassName }: TProps) => {
  const { itemColumnSize } = useTransactionActivityList()

  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex flex-col',
        {
          'w-24 max-w-24 min-w-24': itemColumnSize === 'xs',
          'w-28 max-w-28 min-w-28': itemColumnSize === 'sm',
          'w-32 max-w-32 min-w-32': itemColumnSize === 'md',
          'w-36 max-w-36 min-w-36': itemColumnSize === 'lg',
          'w-40 max-w-40 min-w-40': itemColumnSize === 'xl',
        },
        className
      )}
    >
      {label && <p className={StyleHelper.mergeStyles('font-medium text-gray-300', labelClassName)}>{label}</p>}

      {url ? (
        <Link to={url} target="_blank" className="text-neon flex">
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
