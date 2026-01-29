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
    let txTemplateUrl: string | undefined
    let addressTemplateUrl: string | undefined
    let contractTemplateUrl: string | undefined

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[fromAccount.blockchain]
    if (hasExplorerService(service)) {
      txTemplateUrl = service.explorerService.getTxTemplateUrl()
      addressTemplateUrl = service.explorerService.getAddressTemplateUrl()
      contractTemplateUrl = service.explorerService.getContractTemplateUrl()
    }

    const txIdUrl = txTemplateUrl?.replace('{txId}', txId)

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
        const contractHashUrl = contractTemplateUrl?.replace('{hash}', token.hash)
        const fromUrl = addressTemplateUrl?.replace('{address}', fromAccount.address)
        const toUrl = addressTemplateUrl?.replace('{address}', toAddress)

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
