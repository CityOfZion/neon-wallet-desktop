import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import { buildQueryKeyTokenTransfer, buildQueryKeyTokenTransferAggregate } from '@renderer/hooks/useTokenTransfers'
import { queryClient } from '@renderer/libs/query'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

export class ReactQueryHelper {
  static invalidateTransactionQueries = (
    account: IAccountState,
    network: TNetwork<TBlockchainServiceKey>,
    toAccount?: IAccountState
  ) => {
    queryClient.invalidateQueries({
      queryKey: buildQueryKeyTokenTransfer(account, network),
      refetchType: 'all',
    })

    queryClient.invalidateQueries({
      queryKey: buildQueryKeyTokenTransferAggregate(),
      refetchType: 'all',
    })

    queryClient.invalidateQueries({
      queryKey: buildQueryKeyBalance(account.address, account.blockchain, network),
      refetchType: 'all',
    })

    if (toAccount) {
      queryClient.invalidateQueries({
        queryKey: buildQueryKeyBalance(toAccount.address, toAccount.blockchain, network),
        refetchType: 'all',
      })

      queryClient.invalidateQueries({
        queryKey: buildQueryKeyTokenTransfer(toAccount, network),
        refetchType: 'all',
      })
    }
  }
}
