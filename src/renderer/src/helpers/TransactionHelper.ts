import { hasExplorerService } from '@cityofzion/blockchain-service'

import type { TTransactionHelperBuildPendingTransactionParams } from '@shared/types/helpers'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { BlockchainServiceHelper } from './BlockchainServiceHelper'

export class TransactionHelper {
  static buildPendingTransaction({
    fromAccount,
    txId,
    type,
    events,
  }: TTransactionHelperBuildPendingTransactionParams): TUseTransactionsTransaction {
    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[fromAccount.blockchain]
    const explorerService = hasExplorerService(service) ? service.explorerService : undefined

    const txIdUrl = explorerService?.buildTransactionUrl(txId)

    const transaction: TUseTransactionsTransaction = {
      txId,
      txIdUrl,
      date: new Date().toISOString(),
      account: fromAccount,
      block: 0,
      invocationCount: 0,
      notificationCount: 0,
      networkFeeAmount: undefined,
      systemFeeAmount: undefined,
      isPending: true,
      blockchain: fromAccount.blockchain,
      type: type ?? 'default',
      events: [],
    }

    if (events) {
      transaction.events = events.map(({ amount, toAddress, token, toAccount }) => {
        const contractHashUrl = explorerService?.buildContractUrl(token.hash)
        const fromUrl = explorerService?.buildAddressUrl(fromAccount.address)
        const toUrl = explorerService?.buildAddressUrl(toAddress)

        return {
          eventType: 'token',
          methodName: 'transfer',
          contractHash: token.hash,
          from: fromAccount.address,
          to: toAddress,
          amount,
          token,
          tokenType: 'generic',
          toAccount,
          fromAccount,
          contractHashUrl,
          fromUrl,
          toUrl,
        }
      })
    }

    return transaction
  }
}
