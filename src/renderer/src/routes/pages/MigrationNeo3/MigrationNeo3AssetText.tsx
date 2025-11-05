import { TNeo3NeoLegacyMigrationNeoLegacyAmounts } from '@cityofzion/bs-neo-legacy'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TProps = {
  neoLegacyMigrationAmounts: TNeo3NeoLegacyMigrationNeoLegacyAmounts
  blockchain: TBlockchainServiceKey
  neoTokenSymbol: string
  gasTokenSymbol: string
}

export const MigrationNeo3AssetText = ({
  neoLegacyMigrationAmounts,
  blockchain,
  gasTokenSymbol,
  neoTokenSymbol,
}: TProps) => {
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  const text = match(neoLegacyMigrationAmounts)
    .with({ hasEnoughGasBalance: true, hasEnoughNeoBalance: true }, () => `${neoTokenSymbol} & ${gasTokenSymbol}`)
    .with({ hasEnoughNeoBalance: true }, () => neoTokenSymbol)
    .with({ hasEnoughGasBalance: true }, () => gasTokenSymbol)
    .run()

  return (
    <p className="h-min pr-2 text-sm text-white">
      {text} <span className="text-gray-100">| {tBlockchain(blockchain)}</span>
    </p>
  )
}
