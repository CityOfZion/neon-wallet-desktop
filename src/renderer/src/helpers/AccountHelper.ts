import { TAccountHelperPredicateParams } from '@shared/@types/helpers'

export class AccountHelper {
  static predicate({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address === account.address && blockchain === account.blockchain
  }

  static predicateNot({ address, blockchain }: TAccountHelperPredicateParams) {
    return (account: TAccountHelperPredicateParams) => address !== account.address || blockchain !== account.blockchain
  }
}
