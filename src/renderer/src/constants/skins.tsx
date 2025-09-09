import CozFaceDecember2024 from '@renderer/assets/skins/coz-face-december-2024.png'
import NeoChristmas2024 from '@renderer/assets/skins/neo-christmas-2024.png'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TAccountColorSkin = {
  id: string
  color: string
}

type TLocalSkin = {
  id: string
  blockchain: TBlockchainServiceKey
  collectionHash: string
  component: JSX.Element
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

export const ACCOUNT_LOCAL_SKINS: TLocalSkin[] = [
  {
    id: 'coz-face-december-2024',
    blockchain: 'neo3',
    collectionHash: '0x76a8f8a7a901b29a33013b469949f4b08db15756',
    component: <img src={CozFaceDecember2024} alt="" />,
  },
  {
    id: 'neo-christmas-2024',
    blockchain: 'neox',
    collectionHash: '0x6e8789d940928e656ea47941ed93b0596dd40056',
    component: <img src={NeoChristmas2024} alt="" />,
  },
]

export const LOCAL_SKINS: TLocalSkin[] = [...ACCOUNT_LOCAL_SKINS]
