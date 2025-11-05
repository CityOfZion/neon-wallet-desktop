import { TAccountHelperPredicateParams } from '../types/helpers'

export class SharedAccountHelper {
  static predicate({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address === account.address && blockchain === account.blockchain
  }

  static predicateNot({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address !== account.address || blockchain !== account.blockchain
  }

  static buildAccountKey({ address, blockchain }: TAccountHelperPredicateParams) {
    return `${address}-${blockchain}`
  }
}
