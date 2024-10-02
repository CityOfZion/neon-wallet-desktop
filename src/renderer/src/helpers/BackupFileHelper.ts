import { TBackupFormat } from '@shared/@types/blockchain'

export class BackupFileHelper {
  static convertTypes({ wallets }: TBackupFormat) {
    wallets.forEach(wallet => {
      if (wallet.type === 'ledger') wallet.type = 'hardware'

      wallet.accounts.forEach(account => {
        if (account.type === 'ledger' || account.type === 'hardware') account.type = 'watch'
      })
    })
  }
}
