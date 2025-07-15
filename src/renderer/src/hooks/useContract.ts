import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { useQuery } from '@tanstack/react-query'

import { useSelectedNetworkSelector } from './useSettingsSelector'

type TProps = {
  blockchain: TBlockchainServiceKey
  hash: string
}

export const useContract = ({ blockchain, hash }: TProps) => {
  const { network } = useSelectedNetworkSelector(blockchain)

  return useQuery({
    queryKey: ['contract', network, blockchain, hash],
    queryFn: async () => {
      const service = bsAggregator.blockchainServicesByName[blockchain]
      return service.blockchainDataService.getContract(hash)
    },
    gcTime: Infinity,
    staleTime: Infinity,
  })
}
