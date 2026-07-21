import { TBSToken } from '@cityofzion/blockchain-service'

import { ImageWithFallback } from '@renderer/components/ImageWithFallback'
import { Tooltip } from '@renderer/components/Tooltip'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

type TProps = {
  blockchain: TBlockchainServiceKey
  token: TBSToken
}

export const TokenItem = ({ blockchain, token }: TProps) => (
  <span className="flex size-full min-w-0 items-center text-sm whitespace-pre-wrap text-white">
    <ImageWithFallback
      src={`${ConstantsHelper.neonIconsUrl}/tokens/${blockchain}/${token.hash}.png`}
      alt={token.name || token.symbol}
      fallbackSrc={`${ConstantsHelper.neonIconsUrl}/tokens/default-token.png`}
      imgClassName="size-4.5 max-size-4.5 min-size-4.5 rounded-full"
      className="max-size-6 min-size-6 mr-2 size-6 rounded-full bg-gray-600/50"
    />
    {token.symbol || token.name}
    <Tooltip title={token.hash} contentProps={{ className: 'mx-2' }}>
      <span className="text-gray-100">{` - ${StringHelper.truncateMiddle(token.hash, 16)}`}</span>
    </Tooltip>
  </span>
)
