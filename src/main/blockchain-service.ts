import { TBSAccount } from '@cityofzion/blockchain-service'
import { BSBitcoinConstants } from '@cityofzion/bs-bitcoin'

import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type { TBlockchainServiceKey, TBSAggregator } from '@shared/types/blockchain'

const { t } = SharedI18nextHelper.get()

export class MainBlockchainServiceHelper {
  static bsAggregator: TBSAggregator

  static async getHardwareWalletTransport(account: TBSAccount<TBlockchainServiceKey>) {
    try {
      const { MainHardwareWalletHelper } = await import('./hardware-wallet')
      return await MainHardwareWalletHelper.getTransport(account)
    } catch (error) {
      throw new AppError(t('hardwareWallet.errors.hardwareWalletIsNotConnectOrUnlocked'), error)
    }
  }

  static async setup() {
    const [
      { BSAggregator },
      { BSNeo3 },
      { BSNeoLegacy },
      { BSNeoX },
      { BSEthereum },
      { BSSolana },
      { BSStellar },
      { BSBitcoin },
    ] = await Promise.all([
      import('@cityofzion/bs-multichain'),
      import('@cityofzion/bs-neo3'),
      import('@cityofzion/bs-neo-legacy'),
      import('@cityofzion/bs-neox'),
      import('@cityofzion/bs-ethereum'),
      import('@cityofzion/bs-solana'),
      import('@cityofzion/bs-stellar'),
      import('@cityofzion/bs-bitcoin'),
    ])

    const services = await Promise.all([
      Promise.resolve(new BSNeo3(undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSNeoLegacy(undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSNeoX(undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSStellar(undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSSolana(undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(
        new BSBitcoin(
          SharedEnvHelper.PROD ? undefined : BSBitcoinConstants.TESTNET_NETWORK,
          this.getHardwareWalletTransport.bind(this)
        )
      ),
      Promise.resolve(new BSEthereum('ethereum', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('polygon', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('base', undefined, this.getHardwareWalletTransport.bind(this))),
      Promise.resolve(new BSEthereum('arbitrum', undefined, this.getHardwareWalletTransport.bind(this))),
    ])

    this.bsAggregator = new BSAggregator(services)

    exposeApiToRenderer(this.bsAggregator)
  }
}
