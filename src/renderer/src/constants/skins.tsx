import { TBlockchainServiceKey } from '@renderer/@types/blockchain'

import { ReactComponent as WalletNeonIcon } from '../assets/images/wallet-icon-neon.svg'

export const WALLET_SKINS: {
  id: string
  component: JSX.Element
  blockchain: TBlockchainServiceKey
  unlockedContractHash: string
}[] = [
  {
    id: 'wallet-neon',
    component: <WalletNeonIcon />,
    blockchain: 'neo3',
    unlockedContractHash: '0xd2a4cff31913016155e38e474a2c06d08be276cf',
  },
]

export const SKINS = [...WALLET_SKINS]
