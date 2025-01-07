import ArbitrumBlue from '@renderer/assets/blockchain/images/arbitrum_blue.svg?react'
import ArbitrumGray from '@renderer/assets/blockchain/images/arbitrum_gray.svg?react'
import ArbitrumGreen from '@renderer/assets/blockchain/images/arbitrum_green.svg?react'
import ArbitrumWhite from '@renderer/assets/blockchain/images/arbitrum_white.svg?react'
import BaseBlue from '@renderer/assets/blockchain/images/base_blue.svg?react'
import BaseGray from '@renderer/assets/blockchain/images/base_gray.svg?react'
import BaseGreen from '@renderer/assets/blockchain/images/base_green.svg?react'
import BaseWhite from '@renderer/assets/blockchain/images/base_white.svg?react'
import EthereumBlue from '@renderer/assets/blockchain/images/ethereum_blue.svg?react'
import EthereumGray from '@renderer/assets/blockchain/images/ethereum_gray.svg?react'
import EthereumGreen from '@renderer/assets/blockchain/images/ethereum_green.svg?react'
import EthereumWhite from '@renderer/assets/blockchain/images/ethereum_white.svg?react'
import NeoLegacyBlue from '@renderer/assets/blockchain/images/neo_legacy_blue.svg?react'
import NeoLegacyGray from '@renderer/assets/blockchain/images/neo_legacy_gray.svg?react'
import NeoLegacyGreen from '@renderer/assets/blockchain/images/neo_legacy_green.svg?react'
import NeoLegacyWhite from '@renderer/assets/blockchain/images/neo_legacy_white.svg?react'
import Neo3Blue from '@renderer/assets/blockchain/images/neo3_blue.svg?react'
import Neo3Gray from '@renderer/assets/blockchain/images/neo3_gray.svg?react'
import Neo3Green from '@renderer/assets/blockchain/images/neo3_green.svg?react'
import Neo3White from '@renderer/assets/blockchain/images/neo3_white.svg?react'
import NeoxBlue from '@renderer/assets/blockchain/images/neox_blue.svg?react'
import NeoxGray from '@renderer/assets/blockchain/images/neox_gray.svg?react'
import NeoxGreen from '@renderer/assets/blockchain/images/neox_green.svg?react'
import NeoxWhite from '@renderer/assets/blockchain/images/neox_white.svg?react'
import PolygonBlue from '@renderer/assets/blockchain/images/polygon_blue.svg?react'
import PolygonGray from '@renderer/assets/blockchain/images/polygon_gray.svg?react'
import PolygonGreen from '@renderer/assets/blockchain/images/polygon_green.svg?react'
import PolygonWhite from '@renderer/assets/blockchain/images/polygon_white.svg?react'
import { TBlockchainImageColor, TBlockchainServiceKey } from '@shared/@types/blockchain'

export const blockchainIconsByBlockchain: Record<
  TBlockchainServiceKey,
  Record<TBlockchainImageColor, React.FC<React.SVGProps<SVGSVGElement>>>
> = {
  neo3: {
    gray: Neo3Gray,
    white: Neo3White,
    blue: Neo3Blue,
    green: Neo3Green,
  },
  neoLegacy: {
    gray: NeoLegacyGray,
    white: NeoLegacyWhite,
    blue: NeoLegacyBlue,
    green: NeoLegacyGreen,
  },
  ethereum: {
    gray: EthereumGray,
    white: EthereumWhite,
    blue: EthereumBlue,
    green: EthereumGreen,
  },
  neox: {
    gray: NeoxGray,
    white: NeoxWhite,
    blue: NeoxBlue,
    green: NeoxGreen,
  },
  polygon: {
    gray: PolygonGray,
    white: PolygonWhite,
    blue: PolygonBlue,
    green: PolygonGreen,
  },
  base: {
    gray: BaseGray,
    white: BaseWhite,
    blue: BaseBlue,
    green: BaseGreen,
  },
  arbitrum: {
    gray: ArbitrumGray,
    white: ArbitrumWhite,
    blue: ArbitrumBlue,
    green: ArbitrumGreen,
  },
}
