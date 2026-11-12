import { SwapOrchestrator, type TSwapResult } from '@cityofzion/bs-multichain'
import { useQuery } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

export const PENDING_SWAP_STATUSES: TSwapResult['status'][] = ['confirming', 'exchanging']

export const useSwapOrder = (orderId?: string) => {
  return useQuery({
    queryKey: ['swap-order', orderId],
    queryFn: () => SwapOrchestrator.getOrder(orderId!, BlockchainServiceHelper.bsAggregator),
    enabled: !!orderId,
    // Keeps polling while the swap is still in progress
    refetchInterval: query => {
      const status = query.state.data?.status
      return status && PENDING_SWAP_STATUSES.includes(status) ? 2000 : false
    },
  })
}
