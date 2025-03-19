import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import { buildQueryKeyTokenTransfer, buildQueryKeyTokenTransferAggregate } from '@renderer/hooks/useTokenTransfers'
import { queryClient } from '@renderer/libs/query'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'

export class ReactQueryHelper {
  static invalidateTransactionQueries = (
    transaction: TUseTransactionsTransfer,
    network: TNetwork<TBlockchainServiceKey>
  ) => {
    queryClient.invalidateQueries({
      queryKey: buildQueryKeyTokenTransfer(transaction.account, network),
      refetchType: 'all',
    })

    queryClient.invalidateQueries({
      queryKey: buildQueryKeyTokenTransferAggregate(),
      refetchType: 'all',
    })

    queryClient.invalidateQueries({
      queryKey: buildQueryKeyBalance(transaction.account.address, transaction.account.blockchain, network),
      refetchType: 'all',
    })

    if (transaction.toAccount) {
      queryClient.invalidateQueries({
        queryKey: buildQueryKeyBalance(transaction.toAccount.address, transaction.toAccount.blockchain, network),
        refetchType: 'all',
      })

      queryClient.invalidateQueries({
        queryKey: buildQueryKeyTokenTransfer(transaction.toAccount, network),
        refetchType: 'all',
      })
    }
  }
}
