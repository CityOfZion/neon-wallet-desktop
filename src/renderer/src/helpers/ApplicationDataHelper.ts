import { IWalletState } from '@shared/@types/store'

export class ApplicationDataHelper {
  static convertTypes(wallets: IWalletState[]) {
    wallets.forEach(wallet => {
      if (wallet.type === 'ledger') wallet.type = 'hardware'

      wallet.accounts.forEach(account => {
        if (account.type === 'ledger' || account.type === 'hardware') account.type = 'watch'
      })
    })
  }
}
