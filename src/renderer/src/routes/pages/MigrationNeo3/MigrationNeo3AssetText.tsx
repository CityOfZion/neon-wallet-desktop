import { useTranslation } from 'react-i18next'
import { CalculateNeoLegacyMigrationAmountsResponse } from '@cityofzion/bs-neo-legacy'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { match } from 'ts-pattern'

type TProps = {
  neoLegacyMigrationAmounts: CalculateNeoLegacyMigrationAmountsResponse
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
    <p className="text-white text-sm pr-2">
      {text} <span className="text-gray-100">| {tBlockchain(blockchain)}</span>
    </p>
  )
}
