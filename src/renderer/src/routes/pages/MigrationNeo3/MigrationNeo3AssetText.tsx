import { useTranslation } from 'react-i18next'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TProps = {
  text: string
  blockchain: TBlockchainServiceKey
}

export const MigrationNeo3AssetText = ({ text, blockchain }: TProps) => {
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  return (
    <p className="text-white text-sm pr-2">
      {text} <span className="text-gray-100">| {tBlockchain(blockchain)}</span>
    </p>
  )
}
