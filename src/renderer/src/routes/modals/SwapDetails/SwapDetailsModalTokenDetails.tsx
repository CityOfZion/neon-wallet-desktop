import { useTranslation } from 'react-i18next'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TProps = {
  blockchain?: TBlockchainServiceKey
  symbol: string
  amount: string
}

export const SwapDetailsModalTokenDetails = ({ amount, blockchain, symbol }: TProps) => {
  const { t: commonT } = useTranslation('common')

  return (
    <div className="flex gap-2.5 w-full items-center">
      {blockchain && <BlockchainIcon blockchain={blockchain} />}
      <span className="uppercase">
        {symbol}
        {blockchain && <span className="text-gray-100"> | {commonT(`blockchain.${blockchain}`)}</span>}
      </span>

      <span className="flex-grow text-end">{amount}</span>
    </div>
  )
}
