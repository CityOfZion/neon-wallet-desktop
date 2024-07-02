import { cloneElement } from 'react'
import { SKINS } from '@renderer/constants/skins'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { IWalletState, TWalletType } from '@shared/@types/store'

import { ReactComponent as WalletIconLedger } from '../assets/images/wallet-icon-ledger.svg'
import { ReactComponent as WalletIconStandard } from '../assets/images/wallet-icon-standard.svg'

type TProps = {
  wallet: IWalletState
}

const IMAGES_BY_TYPE: Record<TWalletType, JSX.Element> = {
  ledger: <WalletIconLedger className="-mb-1" />,
  standard: <WalletIconStandard className="-mb-1" />,
}

export const WalletIcon = ({ wallet }: TProps) => {
  const selectedSkin = SKINS.find(skin => skin.id === wallet.selectedSkinId)

  const component = selectedSkin?.component ?? IMAGES_BY_TYPE[wallet.type]

  return cloneElement(component, {
    className: StyleHelper.mergeStyles(
      'w-[2.25rem] h-[2.25rem] min-w-[2rem] min-h-[2.25rem]',
      component.props.className
    ),
  })
}
