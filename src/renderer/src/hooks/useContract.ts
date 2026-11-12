import type { TBSServiceName } from '@cityofzion/bs-multichain'
import { useQuery } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useSelectedNetworkSelector } from './useSettingsSelector'

type TProps = {
  blockchain: TBSServiceName
  hash: string
}

export const useContract = ({ blockchain, hash }: TProps) => {
  const { network } = useSelectedNetworkSelector(blockchain)

  return useQuery({
    queryKey: ['contract', network, blockchain, hash],
    queryFn: async () => {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
      return service.blockchainDataService.getContract(hash)
    },
    gcTime: Infinity,
    staleTime: Infinity,
  })
}
