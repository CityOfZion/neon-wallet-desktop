import { useMemo } from 'react'

import { hasNft } from '@cityofzion/blockchain-service'
import { useInfiniteQuery } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { IAccountState } from '@shared/types/store'

import { useSelectedNetworkSelector } from './useSettingsSelector'

export const useNfts = (account: IAccountState) => {
  const { network } = useSelectedNetworkSelector(account.blockchain)

  const query = useInfiniteQuery({
    queryKey: ['nfts', account.id, network],
    queryFn: async ({ pageParam }) => {
      const blockchainService = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]

      if (!hasNft(blockchainService)) return { items: [] }

      return await blockchainService.nftDataService.getNftsByAddress({
        address: account.address,
        cursor: pageParam,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextPageParams,
  })

  const aggregatedData = useMemo(() => {
    return query.data?.pages.flatMap(page => page.items) ?? []
  }, [query.data])

  return { aggregatedData, ...query }
}
