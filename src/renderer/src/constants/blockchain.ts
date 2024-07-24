import { ReactComponent as EthereumBlue } from '@renderer/assets/blockchain/images/ethereum_blue.svg'
import { ReactComponent as EthereumGray } from '@renderer/assets/blockchain/images/ethereum_gray.svg'
import { ReactComponent as EthereumGreen } from '@renderer/assets/blockchain/images/ethereum_green.svg'
import { ReactComponent as EthereumWhite } from '@renderer/assets/blockchain/images/ethereum_white.svg'
import { ReactComponent as NeoLegacyBlue } from '@renderer/assets/blockchain/images/neo_legacy_blue.svg'
import { ReactComponent as NeoLegacyGray } from '@renderer/assets/blockchain/images/neo_legacy_gray.svg'
import { ReactComponent as NeoLegacyGreen } from '@renderer/assets/blockchain/images/neo_legacy_green.svg'
import { ReactComponent as NeoLegacyWhite } from '@renderer/assets/blockchain/images/neo_legacy_white.svg'
import { ReactComponent as Neo3Blue } from '@renderer/assets/blockchain/images/neo3_blue.svg'
import { ReactComponent as Neo3Gray } from '@renderer/assets/blockchain/images/neo3_gray.svg'
import { ReactComponent as Neo3Green } from '@renderer/assets/blockchain/images/neo3_green.svg'
import { ReactComponent as Neo3White } from '@renderer/assets/blockchain/images/neo3_white.svg'
import { ReactComponent as NeoxBlue } from '@renderer/assets/blockchain/images/neox_blue.svg'
import { ReactComponent as NeoxGray } from '@renderer/assets/blockchain/images/neox_gray.svg'
import { ReactComponent as NeoxGreen } from '@renderer/assets/blockchain/images/neox_green.svg'
import { ReactComponent as NeoxWhite } from '@renderer/assets/blockchain/images/neox_white.svg'
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
}
