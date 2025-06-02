import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { TFullTransactionsItem } from '@shared/@types/hooks'
import { TMigrationNeo3 } from '@shared/@types/store'

import { TransactionActivityListItemHeaderContent } from './TransactionActivityListItemHeaderContent'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  item: TFullTransactionsItem
  migrationNeo3?: TMigrationNeo3
}

export const TransactionActivityListItemHeader = ({ item, migrationNeo3 }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  const { txIdUrl, blockchain } = item

  return (
    <div className="flex h-8.5 max-h-8.5 min-h-8.5 w-full items-center gap-x-2">
      <TransactionActivityListTooltip data={tCommonBlockchain(blockchain)} className="relative -top-2">
        <div className="flex h-full w-20 min-w-20 max-w-20 items-center justify-center gap-x-1 rounded bg-gray-700 px-1">
          <BlockchainIcon blockchain={blockchain} type="default" className="h-3 max-h-3 min-h-3 w-3 min-w-3 max-w-3" />

          <span className="inline-block truncate text-white">{tCommonBlockchain(blockchain)}</span>
        </div>
      </TransactionActivityListTooltip>

      {txIdUrl ? (
        <Link to={txIdUrl} target="_blank" className="block h-full w-full cursor-pointer">
          <TransactionActivityListItemHeaderContent item={item} migrationNeo3={migrationNeo3} />
        </Link>
      ) : (
        <TransactionActivityListItemHeaderContent item={item} migrationNeo3={migrationNeo3} />
      )}
    </div>
  )
}
