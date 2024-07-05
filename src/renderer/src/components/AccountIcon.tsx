import { cloneElement } from 'react'
import { ACCOUNT_COLOR_SKINS, ACCOUNT_LOCAL_SKINS } from '@renderer/constants/skins'
import { IAccountState, TNftSkin } from '@shared/@types/store'

import { BlockchainIcon } from './BlockchainIcon'
type TProps = {
  account: IAccountState
}

const AccountIconColor = ({ account }: TProps) => {
  const color = ACCOUNT_COLOR_SKINS.find(it => it.id === account.skin.id)!.color

  return (
    <div className={`w-full h-full flex items-center  justify-center relative ${color}`}>
      <div className="w-3.5 h-3.5 flex items-center justify-center relative">
        <div className="w-full h-full rounded-full bg-asphalt mix-blend-overlay absolute" />
        <BlockchainIcon blockchain={account.blockchain} type="white" className="w-2 h-2" />
      </div>
    </div>
  )
}

const AccountIconNFT = ({ account }: TProps) => {
  const skin = account.skin as TNftSkin
  return (
    <div className="w-full h-full relative bg-gray-300/30">
      <img src={skin.imgUrl} className="w-full h-full object-cover" />
    </div>
  )
}

const AccountIconLocal = ({ account }: TProps) => {
  const component = ACCOUNT_LOCAL_SKINS.find(it => it.id === account.skin.id)!.component

  return <div className="w-full h-full relative">{cloneElement(component, { className: 'w-full h-full' })}</div>
}

export const AccountIcon = ({ account }: TProps) => {
  return (
    <div className="w-7 h-5 rounded-sm shadow-sm overflow-hidden">
      {account.skin.type === 'color' ? (
        <AccountIconColor account={account} />
      ) : account.skin.type === 'nft' ? (
        <AccountIconNFT account={account} />
      ) : (
        <AccountIconLocal account={account} />
      )}
    </div>
  )
}
