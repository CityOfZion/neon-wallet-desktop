import { WalletKitHelper as BSWalletKitHelper } from '@cityofzion/bs-multichain'
import type { IWalletKit } from '@reown/walletkit'
import { WalletKit } from '@reown/walletkit'
import { Core } from '@walletconnect/core'

import pkg from '../../../../package.json'
import { ConstantsHelper } from './ConstantsHelper'

export class WalletKitHelper extends BSWalletKitHelper {
  static kit: IWalletKit

  static async setup() {
    if (this.kit) return

    const core = new Core({
      projectId: '5de9f0dd59571bdf3b1418df89e8ee49',
      logger: 'silent',
    })

    this.kit = await WalletKit.init({
      core,
      metadata: {
        name: pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1),
        description: pkg.description,
        url: ConstantsHelper.cozWebsiteUrl,
        icons: [`${ConstantsHelper.neonIconsUrl}/neon-logo/128x128.png`],
      },
    })
  }
}
