import { Account, BlockchainService, hasLedger } from '@cityofzion/blockchain-service'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { IAccountState } from '@shared/@types/store'

type TGetServiceAccountParams = {
  account: IAccountState
  key: string
}

export class AccountHelper {
  static predicate({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address === account.address && blockchain === account.blockchain
  }

  static predicateNot({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address !== account.address || blockchain !== account.blockchain
  }

  static getNextOrderOrMissing(accounts: IAccountState[], blockchain: TBlockchainServiceKey) {
    const orders = accounts.filter(account => account.blockchain === blockchain).map(({ order }) => order)

    if (orders.length === 0) return 0

    const maxOrder = Math.max(...orders)

    for (let index = 0; index <= maxOrder; index++) if (!orders.includes(index)) return index

    return maxOrder + 1
  }

  static getBip44Path(service: BlockchainService<TBlockchainServiceKey>, order = 0) {
    return service.bip44DerivationPath.replace('?', order.toString())
  }

  static getServiceAccount({ account, key }: TGetServiceAccountParams) {
    const service = bsAggregator.blockchainServicesByName[account.blockchain]
    let serviceAccount: Account<TBlockchainServiceKey>

    if (account.type === 'hardware' && hasLedger(service)) {
      serviceAccount = service.generateAccountFromPublicKey(key) as Account<TBlockchainServiceKey>
      serviceAccount.isHardware = true
      serviceAccount.bip44Path = AccountHelper.getBip44Path(service, account.order)
    } else serviceAccount = service.generateAccountFromKey(key) as Account<TBlockchainServiceKey>

    return serviceAccount
  }
}
