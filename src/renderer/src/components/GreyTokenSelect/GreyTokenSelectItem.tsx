import { Fragment, useState } from 'react'

import { BSBigNumberHelper } from '@cityofzion/blockchain-service'

import { NEON_ICONS_URL } from '@renderer/constants/urls'

import { Tooltip } from '../Tooltip'
import { TGreyTokenSelectToken } from '.'

type TProps = {
  token: TGreyTokenSelectToken
}

const defaultTokenImageUrl = `${NEON_ICONS_URL}/tokens/default-token.png`

export const GreyTokenSelectItem = ({ token }: TProps) => {
  const blockchain = token.blockchain || token.network
  const network = token.network || token.blockchain

  const [imageUrl, setImageUrl] = useState(`${NEON_ICONS_URL}/tokens/${blockchain}/${token.hash}.png`)

  const handleError = () => {
    const newImageUrl = token.imageUrl

    if (!!newImageUrl && newImageUrl !== imageUrl) {
      setImageUrl(newImageUrl)

      return
    }

    setImageUrl(defaultTokenImageUrl)

    // eslint-disable-next-line react-hooks/immutability
    token.imageUrl = defaultTokenImageUrl
  }

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
