import type { IWalletKit } from '@reown/walletkit'
import { WalletKit } from '@reown/walletkit'
import { Core } from '@walletconnect/core'

import { COZ_WEBSITE_URL, NEON_ICONS_URL } from '@renderer/constants/urls'

import pkg from '../../../../package.json'

export let walletKit: IWalletKit

export async function setupWalletKit() {
  if (walletKit) return

  const core = new Core({
    projectId: '92546a82a052e0a70f22d57fd5764125',
    logger: 'silent',
  })

  walletKit = await WalletKit.init({
    core,
    metadata: {
      name: pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1),
      description: pkg.description,
      url: COZ_WEBSITE_URL,
      icons: [`${NEON_ICONS_URL}/neon-logo/128x128.png`],
    },
  })
}
