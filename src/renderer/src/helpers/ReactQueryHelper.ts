import { QueryClient } from '@tanstack/react-query'

import { buildQueryKeyBalance } from '@renderer/hooks/useBalances'
import { buildTransactionsAggregatedQueryKey, buildTransactionsQueryKey } from '@renderer/hooks/useTransactions'
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
      queryKey: buildVoteNeo3GetVoteDetailsByAddressQueryKey({ neo3Network: network, address }),
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
