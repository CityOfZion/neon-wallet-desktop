import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TProps = {
  blockchain?: TBlockchainServiceKey
  symbol: string
  amount: string
}

export const SwapDetailsModalTokenDetails = ({ amount, blockchain, symbol }: TProps) => {
  const { t: tCommon } = useTranslation('common')

  return (
    <div className="flex w-full items-center gap-2.5">
      {blockchain && <BlockchainIcon blockchain={blockchain} />}
      <span className="uppercase">
        {symbol}
        {blockchain && <span className="text-gray-100"> | {tCommon(`blockchain.${blockchain}`)}</span>}
      </span>

      <span className="grow text-end">{amount}</span>
    </div>
  )
}
