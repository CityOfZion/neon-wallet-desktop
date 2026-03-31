import { useQuery, useQueryClient } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import type { TNetwork } from '@shared/types/blockchain'
import type { IAccountState } from '@shared/types/store'

import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'

export const buildStellarTrustlinesQueryKey = (account: IAccountState<'stellar'>, stellarNetwork: TNetwork) => {
  return ['stellar-trustlines', account.address, stellarNetwork.id]
}

const buildStellarTrustlineTokensQueryKey = (stellarNetwork: TNetwork, filter: string) => {
  return ['stellar-trustline-tokens', stellarNetwork.id, filter]
}

const fetchStellarTrustlines = async (account: IAccountState<'stellar'>) => {
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar
  return await service.trustlineService.getTrustlines(account.address)
}

const fetchStellarTrustlineTokens = async (filter: string) => {
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar
  return await service.trustlineService.getAllTokens({ code: filter })
}

export const useStellarTrustlinesQuery = (account: IAccountState<'stellar'>) => {
  const {
    networkByBlockchain: { stellar: stellarNetwork },
  } = useSelectedNetworkByBlockchainSelector()

  return useQuery({
    queryKey: buildStellarTrustlinesQueryKey(account, stellarNetwork),
    queryFn: () => fetchStellarTrustlines(account),
  })
}

export const useLazyStellarGetTrustlineTokens = () => {
  const queryClient = useQueryClient()
  const {
    networkByBlockchain: { stellar: stellarNetwork },
  } = useSelectedNetworkByBlockchainSelector()

  const getTrustlinesTokens = async (filter: string) => {
    return await queryClient.ensureQueryData({
      queryKey: buildStellarTrustlineTokensQueryKey(stellarNetwork, filter),
      queryFn: fetchStellarTrustlineTokens.bind(null, filter),
    })
  }

  return { getTrustlinesTokens }
}
