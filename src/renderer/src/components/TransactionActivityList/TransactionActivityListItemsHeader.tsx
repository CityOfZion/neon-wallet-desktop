import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListItemsHeaderContent } from './TransactionActivityListItemsHeaderContent'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const TransactionActivityListItemsHeader = ({ transaction }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  return (
    <div className="flex h-8.5 max-h-8.5 min-h-8.5 w-full items-center gap-x-2">
      <TransactionActivityListTooltip data={tCommonBlockchain(transaction.blockchain)} className="relative -top-2">
        <div className="flex h-full w-20 max-w-20 min-w-20 items-center justify-center gap-x-1 rounded-sm bg-gray-700 px-1">
          <BlockchainIcon
            blockchain={transaction.blockchain}
            type="default"
            className="h-3 max-h-3 min-h-3 w-3 max-w-3 min-w-3"
          />

          <span className="inline-block truncate text-white">{tCommonBlockchain(transaction.blockchain)}</span>
        </div>
      </TransactionActivityListTooltip>

      {transaction.txIdUrl ? (
        <Link to={transaction.txIdUrl} target="_blank" className="block h-full w-full cursor-pointer">
          <TransactionActivityListItemsHeaderContent transaction={transaction} />
        </Link>
      ) : (
        <TransactionActivityListItemsHeaderContent transaction={transaction} />
      )}
    </div>
  )
}
