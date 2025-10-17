import { hasLedger, IBlockchainService, TBSAccount } from '@cityofzion/blockchain-service'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

type TGetServiceAccountParams = {
  account: IAccountState
  key: string
}

export class AccountHelper {
  static getNextOrderOrMissing(accounts: IAccountState[], blockchain: TBlockchainServiceKey) {
    const orders = accounts.filter(account => account.blockchain === blockchain).map(({ order }) => order)

    if (orders.length === 0) return 0

    const maxOrder = Math.max(...orders)

    for (let index = 0; index <= maxOrder; index++) if (!orders.includes(index)) return index

    return maxOrder + 1
  }

  static getBip44Path(service: IBlockchainService<TBlockchainServiceKey>, order = 0) {
    return service.bip44DerivationPath.replace('?', order.toString())
  }

  static getServiceAccount({ account, key }: TGetServiceAccountParams) {
    const service = bsAggregator.blockchainServicesByName[account.blockchain]
    let serviceAccount: TBSAccount<TBlockchainServiceKey>

    if (account.type === 'hardware' && hasLedger(service)) {
      serviceAccount = service.generateAccountFromPublicKey(key)
      serviceAccount.isHardware = true
      serviceAccount.bip44Path = AccountHelper.getBip44Path(service, account.order)
    } else {
      serviceAccount = service.generateAccountFromKey(key)
    }

    return serviceAccount
  }
}
