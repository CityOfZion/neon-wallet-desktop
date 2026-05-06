import { Fragment, useEffect, useState } from 'react'

import { BSBigHumanAmount } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { Tooltip } from '../Tooltip'
import { TGreyTokenSelectToken } from '.'

type TProps = {
  token: TGreyTokenSelectToken
  blockchain?: TBlockchainServiceKey
}

const defaultTokenImageUrl = `${ConstantsHelper.neonIconsUrl}/tokens/default-token.png`

export const GreyTokenSelectItem = ({ token, blockchain }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { network } = token
  const blockchainName = blockchain ? tCommonBlockchain(blockchain) : network
  const defaultImageUrl = `${ConstantsHelper.neonIconsUrl}/tokens/${blockchain || network}/${token.hash}.png`

  const [imageUrl, setImageUrl] = useState(defaultImageUrl)

  const handleError = () => {
    const tokenImageUrl = token.imageUrl

    setImageUrl(!!tokenImageUrl && tokenImageUrl !== imageUrl ? tokenImageUrl : defaultTokenImageUrl)
  }

  useEffect(() => {
    setImageUrl(defaultImageUrl)
  }, [defaultImageUrl])

  return (
    <Fragment>
      <img src={imageUrl} className="size-4 rounded-full" onError={handleError} alt={token.symbol} />

      <Tooltip
        title={blockchainName ? `${token.symbol} | ${blockchainName}` : ''}
        contentProps={{ className: 'uppercase' }}
      >
        <span className="flex w-fit min-w-0 items-center gap-1">
          <span className="text-left text-sm text-white uppercase">{token.symbol}</span>
          {blockchainName && <span className="truncate text-sm text-gray-100 uppercase">{` | ${blockchainName}`}</span>}
        </span>
      </Tooltip>

      {token.amount && (
        <span className="text-1xs text-neon ml-auto">{new BSBigHumanAmount(token.amount, 6).toFormatted()}</span>
      )}
    </Fragment>
  )
}
