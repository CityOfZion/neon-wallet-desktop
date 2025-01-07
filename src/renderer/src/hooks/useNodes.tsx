import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TNode } from '@shared/@types/query'
import { useQuery } from '@tanstack/react-query'

import { useSelectedNetworkSelector } from './useSettingsSelector'

const fetchNodes = async (
  blockchain: TBlockchainServiceKey,
  selectedNetwork: TNetwork<TBlockchainServiceKey>
): Promise<TNode[]> => {
  const service = bsAggregator.blockchainServicesByName[blockchain]
  const nodes = (await service.blockchainDataService.getRpcList()) as TNode[]
  if (!nodes.find(({ url }) => url === selectedNetwork.url)) nodes.unshift({ url: selectedNetwork.url })
  return nodes
}

export const useNodes = (blockchain: TBlockchainServiceKey) => {
  const { network } = useSelectedNetworkSelector(blockchain)

  const query = useQuery({
    queryKey: ['nodes', blockchain, network.id],
    queryFn: fetchNodes.bind(null, blockchain, network),
    staleTime: 0,
  })

  return query
}
