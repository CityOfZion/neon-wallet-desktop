import { cloneElement } from 'react'
import { ACCOUNT_COLOR_SKINS, ACCOUNT_LOCAL_SKINS } from '@renderer/constants/skins'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState, TNftSkin } from '@shared/@types/store'

import { BlockchainIcon } from './BlockchainIcon'
type TProps = {
  account: IAccountState
}

type TAccountBlockchainCircleProps = {
  blockchain: TBlockchainServiceKey
}

const AccountBlockchainCircle = ({ blockchain }: TAccountBlockchainCircleProps) => (
  <div className="w-4.5 h-4.5 flex items-center justify-center relative">
    <div className="w-full h-full rounded-full bg-asphalt mix-blend-overlay absolute" />

    <BlockchainIcon blockchain={blockchain} type="white" className="w-2.5 h-2.5" />
  </div>
)

const AccountIconColor = ({ account }: TProps) => {
  const color = ACCOUNT_COLOR_SKINS.find(({ id }) => id === account.skin.id)?.color

  if (!color) return null

  return (
    <div className={`flex w-full h-full items-center justify-center relative ${color}`}>
      <AccountBlockchainCircle blockchain={account.blockchain} />
    </div>
  )
}

const AccountIconNFT = ({ account }: TProps) => {
  const imgUrl = (account.skin as TNftSkin)?.imgUrl

  if (!imgUrl) return null

  return (
    <div className="flex w-full h-full items-center justify-center relative bg-gray-300/30">
      <img aria-hidden={true} src={imgUrl} alt="" className="w-full h-full object-cover absolute inset-0 m-auto" />

      <AccountBlockchainCircle blockchain={account.blockchain} />
    </div>
  )
}

const AccountIconLocal = ({ account }: TProps) => {
  const component = ACCOUNT_LOCAL_SKINS.find(({ id }) => id === account.skin.id)?.component

  if (!component) return null

  return (
    <div className="flex w-full h-full items-center justify-center relative">
      {cloneElement(component, {
        'aria-hidden': true,
        className: 'w-full h-full object-cover absolute inset-0 m-auto',
      })}

      <AccountBlockchainCircle blockchain={account.blockchain} />
    </div>
  )
}

export const AccountIcon = ({ account }: TProps) => {
  return (
    <div className="w-10 h-6 min-w-10 min-h-6 min-w-10 max-h-6 rounded-sm shadow-sm overflow-hidden">
      {account.skin.type === 'nft' ? (
        <AccountIconNFT account={account} />
      ) : account.skin.type === 'local' ? (
        <AccountIconLocal account={account} />
      ) : (
        <AccountIconColor account={account} />
      )}
    </div>
  )
}
