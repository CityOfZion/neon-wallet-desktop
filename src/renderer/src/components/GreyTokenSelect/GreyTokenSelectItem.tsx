import { Fragment, useEffect, useState } from 'react'
import defaultTokenLogo from '@renderer/assets/images/default-token-logo.png'
import { NumberHelper } from '@renderer/helpers/NumberHelper'

import { TGreyTokenSelectToken } from '.'

type TProps = {
  token: TGreyTokenSelectToken
}

export const GreyTokenSelectItem = ({ token }: TProps) => {
  const [img, setImg] = useState(token.imageUrl ?? defaultTokenLogo)

  useEffect(() => {
    setImg(token.imageUrl ?? defaultTokenLogo)
  }, [token])

  return (
    <Fragment>
      <img
        src={img}
        className="w-4 h-4 rounded-full"
        onError={() => {
          setImg(defaultTokenLogo)
          token.imageUrl = defaultTokenLogo
        }}
        alt={token.symbol}
      />

      <span className="flex flex-grow items-center gap-1 min-w-0">
        <span className="text-white text-sm text-left uppercase truncate">{token.symbol}</span>
        {token.network && <span className="text-gray-100 text-sm truncate uppercase">{` | ${token.network}`}</span>}
      </span>

      {token.amount && (
        <span className="text-1xs text-neon truncate">{NumberHelper.formatString(token.amount, 6)}</span>
      )}
    </Fragment>
  )
}
