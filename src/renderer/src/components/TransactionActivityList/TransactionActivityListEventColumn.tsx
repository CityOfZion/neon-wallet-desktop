import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TContentProps = Pick<TProps, 'data'>

type TProps = {
  data: ReactNode
  label?: string
  url?: string
}

const Content = ({ data }: TContentProps) =>
  typeof data === 'string' || typeof data === 'number' ? (
    <TransactionActivityListTooltip data={data}>
      <span className="inline-block max-w-20 truncate">{data}</span>
    </TransactionActivityListTooltip>
  ) : (
    data
  )

export const TransactionActivityListEventColumn = ({ data, label, url }: TProps) => (
  <div className="flex flex-col">
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
