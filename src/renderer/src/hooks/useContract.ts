import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { useQuery } from '@tanstack/react-query'

import { useNetworkTypeSelector } from './useSettingsSelector'

type TProps = {
  blockchain: TBlockchainServiceKey
  hash: string
}

export const useContract = ({ blockchain, hash }: TProps) => {
  const { networkType } = useNetworkTypeSelector()

  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['contract', networkType, blockchain, hash],
    queryFn: async () => {
      const service = bsAggregator.blockchainServicesByName[blockchain]
      return service.blockchainDataService.getContract(hash)
    },
    gcTime: Infinity,
    staleTime: Infinity,
  })

  return query
}
