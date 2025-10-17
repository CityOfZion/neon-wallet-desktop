import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'

import dappFallbackIcon from '@renderer/assets/images/dapp-fallback-icon.png'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import WalletConnectLogo from '@renderer/assets/images/wallet-connect.svg?react'

import { ImageWithFallback } from './ImageWithFallback'

type TProps = {
  session: TSession
}

export const DappPermissionHeader = ({ session }: TProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-center gap-x-12 px-8">
        <NeonWalletLogo aria-hidden className="h-min w-full" />

        <WalletConnectLogo aria-hidden className="h-min w-full opacity-60" />
      </div>

      <ImageWithFallback
        src={session.peer.metadata.icons[0]}
        alt={session.peer.metadata.name}
        fallbackSrc={dappFallbackIcon}
        className="bg-asphalt mt-9 max-h-9 max-w-16 rounded-xs object-contain"
      />
    </div>
  )
}
