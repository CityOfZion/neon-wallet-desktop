import { Fragment, useEffect, useState } from 'react'
import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import defaultTokenLogo from '@renderer/assets/images/default-token-logo.png'

import { Tooltip } from '../Tooltip'

import { TGreyTokenSelectToken } from '.'

type TProps = {
  token: TGreyTokenSelectToken
}

export const GreyTokenSelectItem = ({ token }: TProps) => {
  const [img, setImg] = useState(token.imageUrl ?? defaultTokenLogo)

  const network = token.network || token.blockchain

  useEffect(() => {
    setImg(token.imageUrl ?? defaultTokenLogo)
  }, [token])

  return (
    <Fragment>
      <img
        src={img}
        className="h-4 w-4 rounded-full"
        onError={() => {
          setImg(defaultTokenLogo)
          token.imageUrl = defaultTokenLogo
        }}
        alt={token.symbol}
      />

      <Tooltip title={network ? `${token.symbol} | ${network}` : ''} contentProps={{ className: 'uppercase' }}>
        <span className="flex w-fit min-w-0 items-center gap-1">
          <span className="text-left text-sm uppercase text-white">{token.symbol}</span>
          {network && <span className="truncate text-sm uppercase text-gray-100">{` | ${network}`}</span>}
        </span>
      </Tooltip>

      {token.amount && (
        <span className="ml-auto text-1xs text-neon">{BSBigNumberHelper.format(token.amount, { decimals: 6 })}</span>
      )}
    </Fragment>
  )
}
