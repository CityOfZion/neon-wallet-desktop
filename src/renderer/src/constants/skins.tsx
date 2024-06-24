import { TBlockchainServiceKey } from '@renderer/@types/blockchain'

import { ReactComponent as WalletIconSpongeBob } from '../assets/images/wallet-icon-sponge-bob.svg'

export const WALLET_SKINS: {
  id: string
  component: JSX.Element
  blockchain: TBlockchainServiceKey
  unlockedContractHash: string
}[] = [
  {
    id: 'sponge-bob',
    component: <WalletIconSpongeBob />,
    blockchain: 'neo3',
    unlockedContractHash: '0xd2a4cff31913016155e38e474a2c06d08be276cf',
  },
]

export const SKINS = [...WALLET_SKINS]
