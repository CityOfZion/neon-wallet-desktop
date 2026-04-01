import type { TSkinHelperColorSkin, TSkinHelperLocalSkin } from '@shared/types/helpers'
import type { TColorSkin } from '@shared/types/store'

import { ConstantsHelper } from './ConstantsHelper'
import { NumberHelper } from './NumberHelper'

export class SkinHelper {
  static readonly accountColorSkins: Map<string, TSkinHelperColorSkin> = new Map([
    ['green', { id: 'green', color: 'bg-[#00DDB4]' }],
    ['blue', { id: 'blue', color: 'bg-[#4786FF]' }],
    ['lightBlue', { id: 'lightBlue', color: 'bg-[#47BEFF]' }],
    ['magenta', { id: 'magenta', color: 'bg-[#D355E7]' }],
    ['yellow', { id: 'yellow', color: 'bg-[#FEC42F]' }],
    ['purple', { id: 'purple', color: 'bg-[#9747FF]' }],
    ['orange', { id: 'orange', color: 'bg-[#FE872F]' }],
  ])

  static readonly accountLocalSkins: Map<string, TSkinHelperLocalSkin> = new Map([
    [
      'coz-face-december-2024',
      {
        blockchain: 'neo3',
        collectionHash: '0x76a8f8a7a901b29a33013b469949f4b08db15756',
        component: <img src={`${ConstantsHelper.neonIconsUrl}/skins/coz-face-december-2024.png`} alt="" />,
      },
    ],
    [
      'neo-christmas-2024',
      {
        blockchain: 'neox',
        collectionHash: '0x6e8789d940928e656ea47941ed93b0596dd40056',
        component: <img src={`${ConstantsHelper.neonIconsUrl}/skins/neo-christmas-2024.png`} alt="" />,
      },
    ],
  ])

  static readonly localSkins = new Map(this.accountLocalSkins)

  static getSkinColor(index?: number) {
    const newIndex = index ?? NumberHelper.getRandomNumber(7)
    const skinIds = Array.from(this.accountColorSkins.keys())

    return this.accountColorSkins.get(skinIds[newIndex])?.id || this.accountColorSkins.get(skinIds[0])!.id
  }

  static generateColorSkin(colorIndex?: number): TColorSkin {
    return { id: this.getSkinColor(colorIndex), type: 'color' }
  }

  static isColorSkin(value: string) {
    return this.accountColorSkins.has(value)
  }
}
