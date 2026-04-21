import { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TProps = {
  blockchain?: TBlockchainServiceKey
  symbol: string
  amount?: string
} & ComponentProps<'div'>

export const TokenDetails = ({ amount, blockchain, symbol, className, ...props }: TProps) => {
  const { t: tCommon } = useTranslation('common')

  return (
    <div className={StyleHelper.mergeStyles('flex w-full items-center gap-2.5', className)} {...props}>
      {blockchain && <BlockchainIcon blockchain={blockchain} />}
      <span className="uppercase">
        {symbol}
        {blockchain && <span className="text-gray-100">{` | ${tCommon(`blockchain.${blockchain}`)}`}</span>}
      </span>

      {amount && <span className="grow text-end">{amount}</span>}
    </div>
  )
}
