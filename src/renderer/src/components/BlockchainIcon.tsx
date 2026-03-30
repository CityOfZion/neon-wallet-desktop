import React from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import ArbitrumIcon from '@renderer/assets/images/blockchain/arbitrum.svg?react'
import BaseIcon from '@renderer/assets/images/blockchain/base.svg?react'
import BitcoinIcon from '@renderer/assets/images/blockchain/bitcoin.svg?react'
import EthereumIcon from '@renderer/assets/images/blockchain/ethereum.svg?react'
import NeoLegacyIcon from '@renderer/assets/images/blockchain/neo_legacy.svg?react'
import Neo3Icon from '@renderer/assets/images/blockchain/neo3.svg?react'
import NeoxIcon from '@renderer/assets/images/blockchain/neox.svg?react'
import PolygonIcon from '@renderer/assets/images/blockchain/polygon.svg?react'
import SolanaIcon from '@renderer/assets/images/blockchain/solana.svg?react'
import StellarIcon from '@renderer/assets/images/blockchain/stellar.svg?react'

import type { TBlockchainServiceKey } from '@shared/types/blockchain'

export const ICONS_BY_BLOCKCHAIN: Record<TBlockchainServiceKey, React.FC<React.SVGProps<SVGSVGElement>>> = {
  neo3: Neo3Icon,
  neoLegacy: NeoLegacyIcon,
  ethereum: EthereumIcon,
  neox: NeoxIcon,
  polygon: PolygonIcon,
  base: BaseIcon,
  arbitrum: ArbitrumIcon,
  solana: SolanaIcon,
  stellar: StellarIcon,
  bitcoin: BitcoinIcon,
}

type Props = React.SVGProps<SVGSVGElement> & {
  blockchain: TBlockchainServiceKey
}

export const BlockchainIcon = React.memo(({ blockchain, ...props }: Props) => {
  const Component = ICONS_BY_BLOCKCHAIN[blockchain]

  return (
    <Component
      {...props}
      className={StyleHelper.mergeStyles(
        'size-4 object-contain',
        {
          '[--blockchain-icon-color:currentColor]': props.className?.includes('text-'),
        },
        props.className
      )}
    />
  )
})
