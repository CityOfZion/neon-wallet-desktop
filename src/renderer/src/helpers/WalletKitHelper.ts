import { WalletKitHelper as BSWalletKitHelper } from '@cityofzion/bs-multichain'
import type { IWalletKit } from '@reown/walletkit'
import { WalletKit } from '@reown/walletkit'
import { Core } from '@walletconnect/core'

import pkg from '../../../../package.json'
import { ConstantsHelper } from './ConstantsHelper'
import { StringHelper } from './StringHelper'

export class WalletKitHelper extends BSWalletKitHelper {
  static kit: IWalletKit

  static async setup() {
    if (this.kit) return

    const core = new Core({
      projectId: '92546a82a052e0a70f22d57fd5764125',
      logger: 'silent',
    })

    this.kit = await WalletKit.init({
      core,
      metadata: {
        name: StringHelper.capitalize(pkg.name),
        description: pkg.description,
        url: ConstantsHelper.cozWebsiteUrl,
        icons: [`${ConstantsHelper.neonIconsUrl}/neon-logo/128x128.png`],
      },
    })
  }
}
