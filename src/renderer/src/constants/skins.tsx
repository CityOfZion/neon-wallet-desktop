import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TAccountColorSkin = {
  id: string
  color: string
}

type TLocalSkin = {
  id: string
  component: JSX.Element
  blockchain: TBlockchainServiceKey
  unlockedContractHash: string
}

export const ACCOUNT_COLOR_SKINS: TAccountColorSkin[] = [
  { id: 'green', color: 'bg-[#00DDB4]' },
  { id: 'blue', color: 'bg-[#4786FF]' },
  { id: 'lightBlue', color: 'bg-[#47BEFF]' },
  { id: 'magenta', color: 'bg-[#D355E7]' },
  { id: 'yellow', color: 'bg-[#FEC42F]' },
  { id: 'purple', color: 'bg-[#9747FF]' },
  { id: 'orange', color: 'bg-[#FE872F]' },
]

export const ACCOUNT_LOCAL_SKINS: TLocalSkin[] = []

export const LOCAL_SKINS: TLocalSkin[] = [...ACCOUNT_LOCAL_SKINS]
