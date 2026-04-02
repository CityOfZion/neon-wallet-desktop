import { cloneElement } from 'react'

import type { JSX } from 'react/jsx-runtime'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import WalletIconHardware from '@renderer/assets/images/wallet-icon-hardware.svg?react'
import WalletIconStandard from '@renderer/assets/images/wallet-icon-standard.svg?react'

import { TWallet, TWalletType } from '@shared/types/store'

type TProps = {
  wallet: TWallet
}

const IMAGES_BY_TYPE: Record<TWalletType, JSX.Element> = {
  hardware: <WalletIconHardware className="-mb-1" />,
  standard: <WalletIconStandard className="-mb-1" />,
}

export const WalletIcon = ({ wallet }: TProps) => {
  const component = IMAGES_BY_TYPE[wallet.type]

  return cloneElement(component, {
    className: StyleHelper.mergeStyles('w-9 h-9 min-w-8 min-h-9', component.props.className),
  })
}
