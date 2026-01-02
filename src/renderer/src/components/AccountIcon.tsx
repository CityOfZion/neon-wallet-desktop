import { cloneElement, type ComponentProps } from 'react'

import { SkinHelper } from '@renderer/helpers/SkinHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { IAccountState, TNftSkin } from '@shared/types/store'

import { BlockchainIcon } from './BlockchainIcon'
type TProps = {
  account: IAccountState
} & ComponentProps<'div'>

type TAccountBlockchainCircleProps = {
  blockchain: TBlockchainServiceKey
}

const AccountBlockchainCircle = ({ blockchain }: TAccountBlockchainCircleProps) => (
  <div className="relative flex h-4.5 w-4.5 items-center justify-center">
    <div className="bg-asphalt absolute h-full w-full rounded-full mix-blend-overlay" />

    <BlockchainIcon blockchain={blockchain} type="white" className="h-2.5 w-2.5" />
  </div>
)

const AccountIconColor = ({ account, className, ...props }: TProps) => {
  const color = SkinHelper.accountColorSkins.get(account.skin.id)?.color

  if (!color) return null

  return (
    <div
      className={StyleHelper.mergeStyles(`relative flex h-full w-full items-center justify-center`, color, className)}
      {...props}
    >
      <AccountBlockchainCircle blockchain={account.blockchain} />
    </div>
  )
}

const AccountIconNFT = ({ account }: TProps) => {
  const imgUrl = (account.skin as TNftSkin)?.imgUrl

  if (!imgUrl) return null

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gray-300/30">
      <img aria-hidden src={imgUrl} alt="" className="absolute inset-0 m-auto h-full w-full object-cover" />

      <AccountBlockchainCircle blockchain={account.blockchain} />
    </div>
  )
}

const AccountIconLocal = ({ account }: TProps) => {
  const component = SkinHelper.localSkins.get(account.skin.id)?.component
  if (!component) return null

  return (
    <div className="relative flex h-full w-full items-center justify-center">
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
    <div className="h-6 max-h-6 min-h-6 w-10 min-w-10 overflow-hidden rounded-xs shadow-xs">
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
