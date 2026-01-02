import { QueryClient } from '@tanstack/react-query'

import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import {
  buildGetFullTransactionsAggregatedQueryKey,
  buildGetFullTransactionsQueryKey,
} from '@renderer/hooks/useGetFullTransactions'
import { buildVoteNeo3GetVoteDetailsByAddressQueryKey } from '@renderer/hooks/useVoteNeo3'

import { TNetwork } from '@shared/types/blockchain'
import { IAccountState } from '@shared/types/store'

export class ReactQueryHelper {
  static readonly client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
        staleTime: 60 * 1000, // 1 minute
      },
    },
  })

  static invalidateTransactionQueries = (account: IAccountState, network: TNetwork, toAccount?: IAccountState) => {
    this.client.removeQueries({
      queryKey: buildGetFullTransactionsQueryKey({ account, network }),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildGetFullTransactionsAggregatedQueryKey(),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildQueryKeyBalance(account.address, account.blockchain, network),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildVoteNeo3GetVoteDetailsByAddressQueryKey({ neo3Network: network, address: account.address }),
      type: 'all',
    })

    if (toAccount) {
      this.client.removeQueries({
        queryKey: buildQueryKeyBalance(toAccount.address, toAccount.blockchain, network),
        type: 'all',
      })

      this.client.removeQueries({
        queryKey: buildGetFullTransactionsQueryKey({ account: toAccount, network }),
        type: 'all',
      })
    }
  }
}
