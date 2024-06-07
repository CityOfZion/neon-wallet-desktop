import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { useQuery } from '@tanstack/react-query'

import { useSelectedNetworkSelector } from './useSettingsSelector'

const fetchNodes = async (blockchain: TBlockchainServiceKey) => {
  const service = bsAggregator.blockchainServicesByName[blockchain]
  return await service.blockchainDataService.getRpcList()
}

export const useNodes = (blockchain: TBlockchainServiceKey) => {
  const { network } = useSelectedNetworkSelector(blockchain)

  const query = useQuery({
    queryKey: ['nodes', blockchain, network.type],
    queryFn: fetchNodes.bind(null, blockchain),
    staleTime: 0,
  })

  return query
}
