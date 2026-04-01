import { QueryClient } from '@tanstack/react-query'

import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import { buildNeo3VoteGetVoteDetailsByAddressQueryKey } from '@renderer/hooks/useNeo3Vote'
import { buildTransactionsAggregatedQueryKey, buildTransactionsQueryKey } from '@renderer/hooks/useTransactions'

import { TNetwork } from '@shared/types/blockchain'
import { TAccount } from '@shared/types/store'

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

  static invalidateTransactionQueries = (account: TAccount, network: TNetwork, toAccount?: TAccount) => {
    const { address, blockchain } = account

    this.client.removeQueries({
      queryKey: buildQueryKeyBalance(address, blockchain, network),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildTransactionsQueryKey({ account, network }),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildTransactionsAggregatedQueryKey(),
      type: 'all',
    })

    this.client.removeQueries({
      queryKey: buildNeo3VoteGetVoteDetailsByAddressQueryKey({ neo3Network: network, address }),
      type: 'all',
    })

    if (toAccount) {
      this.client.removeQueries({
        queryKey: buildQueryKeyBalance(toAccount.address, toAccount.blockchain, network),
        type: 'all',
      })

      this.client.removeQueries({
        queryKey: buildTransactionsQueryKey({ account: toAccount, network }),
        type: 'all',
      })
    }
  }
}
