import { SwapOrchestrator, type TSwapApiGetOrdersByAddressParams } from '@cityofzion/bs-multichain'
import { useQueries } from '@tanstack/react-query'

type TSwapOrder = Awaited<ReturnType<typeof SwapOrchestrator.getOrdersByAddress>>[number]

type TParams = Partial<Omit<TSwapApiGetOrdersByAddressParams, 'address'>> & {
  addresses: string[]
  enabled?: boolean
}

export const useSwapOrdersByAddresses = ({ addresses, limit, offset, enabled = true }: TParams) => {
  const uniqueAddresses = Array.from(new Set(addresses.filter(Boolean)))

  return useQueries({
    queries: uniqueAddresses.map(address => ({
      queryKey: ['swap-orders-by-address', address, limit, offset],
      queryFn: () => SwapOrchestrator.getOrdersByAddress({ address, limit, offset }),
      enabled,
    })),
    combine: results => ({
      isLoading: results.some(result => result.isLoading),
      data: results.flatMap(result => result.data || []) as TSwapOrder[],
    }),
  })
}
