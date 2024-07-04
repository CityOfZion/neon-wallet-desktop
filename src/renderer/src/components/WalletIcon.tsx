import { cloneElement, useMemo } from 'react'
import { LOCAL_WALLET_SKINS } from '@renderer/constants/skins'
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
  const selectedWalletLocalSkin = useMemo(() => {
    if (!wallet.selectedSkin || wallet.selectedSkin.type !== 'local') return
    const selectedSkin = wallet.selectedSkin

    return LOCAL_WALLET_SKINS.find(skin => skin.id === selectedSkin.id)
  }, [wallet])

  const component = selectedWalletLocalSkin?.component ?? IMAGES_BY_TYPE[wallet.type]

  return cloneElement(component, {
    className: StyleHelper.mergeStyles(
      'w-[2.25rem] h-[2.25rem] min-w-[2rem] min-h-[2.25rem]',
      component.props.className
    ),
  })
}
