import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import {
  buildGetFullTransactionsAggregatedQueryKey,
  buildGetFullTransactionsQueryKey,
} from '@renderer/hooks/useGetFullTransactions'
import { buildVoteNeo3GetVoteDetailsByAddressQueryKey } from '@renderer/hooks/useVoteNeo3'

import { queryClient } from '@renderer/libs/query'
import { TNetwork } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

export class ReactQueryHelper {
  static invalidateTransactionQueries = (account: IAccountState, network: TNetwork, toAccount?: IAccountState) => {
    queryClient.removeQueries({
      queryKey: buildGetFullTransactionsQueryKey({ account, network }),
      type: 'all',
    })

    queryClient.removeQueries({
      queryKey: buildGetFullTransactionsAggregatedQueryKey(),
      type: 'all',
    })

    queryClient.removeQueries({
      queryKey: buildQueryKeyBalance(account.address, account.blockchain, network),
      type: 'all',
    })

    queryClient.removeQueries({
      queryKey: buildVoteNeo3GetVoteDetailsByAddressQueryKey({ neo3Network: network, address: account.address }),
      type: 'all',
    })

    if (toAccount) {
      queryClient.removeQueries({
        queryKey: buildQueryKeyBalance(toAccount.address, toAccount.blockchain, network),
        type: 'all',
      })

      queryClient.removeQueries({
        queryKey: buildGetFullTransactionsQueryKey({ account: toAccount, network }),
        type: 'all',
      })
    }
  }
}
