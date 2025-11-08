import { Fragment, useEffect, useState } from 'react'

import { BSBigNumberHelper } from '@cityofzion/blockchain-service'

import { NEON_ICONS_URL } from '@renderer/constants/urls'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { Tooltip } from '../Tooltip'
import { TGreyTokenSelectToken } from '.'

type TProps = {
  token: TGreyTokenSelectToken
  blockchain?: TBlockchainServiceKey
}

const defaultTokenImageUrl = `${NEON_ICONS_URL}/tokens/default-token.png`

export const GreyTokenSelectItem = ({ token, blockchain }: TProps) => {
  const network = token.network || blockchain
  const defaultImageUrl = `${NEON_ICONS_URL}/tokens/${blockchain || token.network}/${token.hash}.png`

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
      <img src={imageUrl} className="h-4 w-4 rounded-full" onError={handleError} alt={token.symbol} />

      <Tooltip title={network ? `${token.symbol} | ${network}` : ''} contentProps={{ className: 'uppercase' }}>
        <span className="flex w-fit min-w-0 items-center gap-1">
          <span className="text-left text-sm text-white uppercase">{token.symbol}</span>
          {network && <span className="truncate text-sm text-gray-100 uppercase">{` | ${network}`}</span>}
        </span>
      </Tooltip>

      {token.amount && (
        <span className="text-1xs text-neon ml-auto">{BSBigNumberHelper.format(token.amount, { decimals: 6 })}</span>
      )}
    </Fragment>
  )
}
