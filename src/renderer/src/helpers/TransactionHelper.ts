import type { TTransactionHelperBuildPendingTransactionParams } from '@shared/types/helpers'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'

export class TransactionHelper {
  static buildPendingTransaction({
    transaction,
    account,
    senderAccount,
    receiverAccounts,
  }: TTransactionHelperBuildPendingTransactionParams): TUseTransactionsTransaction {
    const pendingTransaction: TUseTransactionsTransaction = {
      ...transaction,
      account,
      isPending: true,
      blockchain: account.blockchain,
    }

    if (pendingTransaction.view === 'utxo') {
      pendingTransaction.inputs = pendingTransaction.inputs.map(input => ({ ...input, account: senderAccount }))
      pendingTransaction.outputs = pendingTransaction.outputs.map((output, index) => ({
        ...output,
        account: receiverAccounts?.[index],
      }))
    } else {
      pendingTransaction.events = pendingTransaction.events.map((event, index) => ({
        ...event,
        fromAccount: senderAccount,
        toAccount: receiverAccounts?.[index],
      }))
    }

    return pendingTransaction
  }
}
