import { BSKeychainHelper, hasLedger, TBSAccount } from '@cityofzion/blockchain-service'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TAccount } from '@shared/types/store'

import { BlockchainServiceHelper } from './BlockchainServiceHelper'
import { ReduxHelper } from './ReduxHelper'

const { t } = SharedI18nextHelper.get()

export class AccountHelper {
  static getNextOrderOrMissing(accounts: TAccount[], blockchain: TBlockchainServiceKey) {
    const orders = accounts.filter(account => account.blockchain === blockchain).map(({ order }) => order)

    if (orders.length === 0) return 0

    const maxOrder = Math.max(...orders)

    for (let index = 0; index <= maxOrder; index++) if (!orders.includes(index)) return index

    return maxOrder + 1
  }

  static async getServiceAccount<T extends TBlockchainServiceKey>(account: TAccount<T>): Promise<TBSAccount<T>> {
    if (!account.encryptedKey) {
      throw new AppError(t('common:errors.unexpectedError'))
    }

    const {
      auth: {
        memoryData: { loginSession },
      },
    } = ReduxHelper.store.getState()

    if (!loginSession) {
      throw new AppError(t('common:errors.loginSessionIsNotDefined'))
    }

    const key = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: loginSession.encryptedPassword,
    })

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByNameRecord[account.blockchain]

    if (account.type === 'hardware' && hasLedger(service)) {
      const serviceAccount = await service.generateAccountFromPublicKey(key)

      serviceAccount.isHardware = true
      serviceAccount.bipPath = BSKeychainHelper.getBipPath(service.bipDerivationPath, account.order)

      return serviceAccount as TBSAccount<T>
    }

    const serviceAccount = await service.generateAccountFromKey(key)

    return serviceAccount as TBSAccount<T>
  }
}
