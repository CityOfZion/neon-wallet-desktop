import { useCallback } from 'react'

import { TBSNetworkId } from '@cityofzion/blockchain-service'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import type { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TBaseOptions, TPingNetwork } from '@shared/types/query'

import { useSelectedNetworkByBlockchainSelector, useSelectedNetworkSelector } from './useSettingsSelector'

const buildPingNetworksQueryKey = (blockchain: TBlockchainServiceKey, id: TBSNetworkId) => {
  return ['ping-networks', blockchain, id]
}

const pingNetworks = async (blockchain: TBlockchainServiceKey): Promise<TPingNetwork[]> => {
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  const promises = service.networkUrls.map(async url => {
    try {
      return await service.pingNetwork(url)
    } catch {
      return { height: undefined, latency: undefined, url }
    }
  })

  const data = await Promise.all(promises)

  return data.toSorted((a, b) => {
    const latencyA = a.latency
    const latencyB = b.latency
    const isLatencyAInvalid = typeof latencyA !== 'number' || isNaN(latencyA)
    const isLatencyBInvalid = typeof latencyB !== 'number' || isNaN(latencyB)

    if (isLatencyAInvalid && isLatencyBInvalid) return 0
    if (isLatencyAInvalid) return 1
    if (isLatencyBInvalid) return -1

    return latencyA - latencyB
  })
}

export const usePingNetworks = (blockchain: TBlockchainServiceKey, queryOptions?: TBaseOptions<TPingNetwork[]>) => {
  const { network } = useSelectedNetworkSelector(blockchain)

  return useQuery({
    queryKey: buildPingNetworksQueryKey(blockchain, network.id),
    queryFn: pingNetworks.bind(null, blockchain),
    ...queryOptions,
  })
}

export const useLazyPingNetworks = () => {
  const queryClient = useQueryClient()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()

  const getPingNetworks = useCallback(
    async (blockchain: TBlockchainServiceKey) => {
      const selectedNetwork = networkByBlockchainRef.current[blockchain]

      return await queryClient.ensureQueryData({
        queryKey: buildPingNetworksQueryKey(blockchain, selectedNetwork.id),
        queryFn: pingNetworks.bind(null, blockchain),
        staleTime: 0,
      })
    },
    [queryClient, networkByBlockchainRef]
  )

  return { getPingNetworks }
}
