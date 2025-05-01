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
    <div className="flex items-center h-8.5 min-h-8.5 max-h-8.5 gap-x-2 w-full">
      <TransactionActivityListTooltip data={tCommonBlockchain(blockchain)}>
        <div className="px-1 flex items-center gap-x-2 justify-center rounded bg-gray-700 w-20 min-w-20 max-w-20 h-full">
          <BlockchainIcon blockchain={blockchain} type="default" className="w-3 min-w-3 max-w-3 h-3 min-h-3 max-h-3" />

          <span className="text-white inline-block truncate">{tCommonBlockchain(blockchain)}</span>
        </div>
      </TransactionActivityListTooltip>

      {txIdUrl ? (
        <Link to={txIdUrl} target="_blank" className="block w-full cursor-pointer h-full">
          <TransactionActivityListItemHeaderContent item={item} migrationNeo3={migrationNeo3} />
        </Link>
      ) : (
        <TransactionActivityListItemHeaderContent item={item} migrationNeo3={migrationNeo3} />
      )}
    </div>
  )
}
