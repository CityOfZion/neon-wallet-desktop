import { useCallback, useMemo } from 'react'

import { BSBigHumanAmount } from '@cityofzion/blockchain-service'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

import type {
  TUseNeo3VoteBuildCalculateVoteFeeQueryKeyParams,
  TUseNeo3VoteBuildGetCandidatesToVoteQueryKeyParams,
  TUseNeo3VoteBuildGetVoteDetailsByAddressQueryKeyParams,
  TUseNeo3VoteCalculateVoteFeeParams,
  TUseNeo3VoteValidationsParams,
} from '@shared/types/hooks'

const buildNeo3VoteGetCandidatesToVoteQueryKey = ({
  neo3Network,
}: TUseNeo3VoteBuildGetCandidatesToVoteQueryKeyParams): any[] => ['neo3-vote-get-candidates-to-vote', neo3Network]

export const buildNeo3VoteGetVoteDetailsByAddressQueryKey = ({
  neo3Network,
  address,
}: TUseNeo3VoteBuildGetVoteDetailsByAddressQueryKeyParams) => {
  const key: any[] = ['neo3-vote-get-vote-details-by-address', neo3Network]

  if (address) key.push(address)

  return key
}

const buildNeo3VoteCalculateVoteFeeQueryKey = ({
  neo3Network,
  candidatePubKey,
  neo3Account,
}: TUseNeo3VoteBuildCalculateVoteFeeQueryKeyParams) => {
  const key: any[] = ['neo3-vote-calculate-vote-fee', neo3Network]

  if (candidatePubKey) key.push(candidatePubKey)
  if (neo3Account) key.push(neo3Account)

  return key
}

export const useNeo3VoteGetCandidatesToVote = () => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  return useQuery({
    queryKey: buildNeo3VoteGetCandidatesToVoteQueryKey({ neo3Network }),
    queryFn: () => BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3.voteService.getCandidatesToVote(),
    enabled: neo3Network.type === 'mainnet',
  })
}

export const useNeo3VoteGetVoteDetailsByAddress = (address?: string) => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  return useQuery({
    queryKey: buildNeo3VoteGetVoteDetailsByAddressQueryKey({ neo3Network, address }),
    queryFn: () =>
      BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3.voteService.getVoteDetailsByAddress(address!),
    enabled: !!address && neo3Network.type === 'mainnet',
  })
}

export const useLazyNeo3VoteGetVoteDetailsByAddress = () => {
  const queryClient = useQueryClient()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const getVoteDetails = useCallback(
    async (address: string) => {
      const neo3Network = networkByBlockchain.neo3
      if (neo3Network.type !== 'mainnet') return

      return await queryClient.ensureQueryData({
        queryKey: buildNeo3VoteGetVoteDetailsByAddressQueryKey({ neo3Network, address }),
        queryFn: () =>
          BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3.voteService.getVoteDetailsByAddress(
            address
          ),
      })
    },
    [networkByBlockchain, queryClient]
  )

  return { getVoteDetails }
}

export const useNeo3VoteCalculateVoteFee = ({ neo3Account, candidatePubKey }: TUseNeo3VoteCalculateVoteFeeParams) => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  return useQuery({
    queryKey: buildNeo3VoteCalculateVoteFeeQueryKey({ neo3Network, candidatePubKey, neo3Account }),
    queryFn: async () => {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3

      const account = await AccountHelper.getServiceAccount(neo3Account!)

      return await service.voteService.calculateVoteFee({
        account,
        candidatePubKey,
      })
    },
    enabled: neo3Account && neo3Account.type !== 'watch' && !!candidatePubKey && neo3Network.type === 'mainnet',
    staleTime: 0,
    gcTime: 0,
  })
}

export const useNeo3VoteValidations = ({ balanceQuery, gasFee }: TUseNeo3VoteValidationsParams) => {
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.neo3

  const hasEnoughGasToPayFee = useMemo(() => {
    const gasAmountNumber = balanceQuery.data?.tokensBalances?.find(({ token }) =>
      service.tokenService.predicateByHash(service.feeToken, token)
    )?.amountNumber

    if (gasAmountNumber === undefined || gasFee === undefined) return undefined

    return new BSBigHumanAmount(gasFee).isLessThanOrEqualTo(gasAmountNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceQuery.data?.tokensBalances, gasFee])

  return { hasEnoughGasToPayFee }
}
