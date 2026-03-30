import { TBSAccount } from '@cityofzion/blockchain-service'
import { BSBitcoinConstants } from '@cityofzion/bs-bitcoin'
import type { BSAggregator } from '@cityofzion/bs-multichain'

import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'

const { t } = SharedI18nextHelper.get()

export class MainBlockchainServiceHelper {
  static bsAggregator: BSAggregator<TBlockchainServiceKey>

  static async getHardwareWalletTransport(account: TBSAccount<TBlockchainServiceKey>) {
    try {
      const { MainHardwareWalletHelper } = await import('./hardware-wallet')
      return await MainHardwareWalletHelper.getTransport(account)
    } catch (error) {
      throw new AppError(t('hardwareWallet.errors.hardwareWalletIsNotConnectOrUnlocked'), error)
    }
  }

  static async setup() {
    const [{ BSAggregator }, { BSNeo3 }, { BSNeoLegacy }, { BSNeoX }, { BSBitcoin }, { BSEthereum }, { BSSolana }] =
      await Promise.all([
        import('@cityofzion/bs-multichain'),
        import('@cityofzion/bs-neo3'),
        import('@cityofzion/bs-neo-legacy'),
        import('@cityofzion/bs-neox'),
        import('@cityofzion/bs-bitcoin'),
        import('@cityofzion/bs-ethereum'),
        import('@cityofzion/bs-solana'),
      ])

    const services = await Promise.all([
      Promise.resolve(new BSNeo3('neo3', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSNeoLegacy('neoLegacy', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSNeoX('neox', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(
        new BSBitcoin(
          'bitcoin',
          SharedEnvHelper.PROD ? undefined : BSBitcoinConstants.TESTNET_NETWORK,
          this.getHardwareWalletTransport.bind(this)
        )
      ),
      Promise.resolve(new BSSolana('solana', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('ethereum', 'ethereum', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('polygon', 'polygon', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('base', 'base', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('arbitrum', 'arbitrum', undefined, this.getHardwareWalletTransport.bind(this))),
    ])

    this.bsAggregator = new BSAggregator<TBlockchainServiceKey>(services)

    exposeApiToRenderer(this.bsAggregator)
  }
}
