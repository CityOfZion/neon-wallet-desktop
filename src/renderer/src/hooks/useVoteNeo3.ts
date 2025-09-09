import { useMemo } from 'react'
import { BSNeo3, GetVoteDetailsByAddressResponse } from '@cityofzion/bs-neo3'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TNetwork } from '@shared/@types/blockchain'
import { TUseBalanceResult } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { useQueries, useQuery } from '@tanstack/react-query'

type TCalculateVoteFeeParams = {
  neo3Account?: IAccountState
  candidatePubKey: string
}

type TValidationsParams = {
  balanceQuery: TUseBalanceResult
  gasFee?: string
}

type TBuildVoteNeo3GetCandidatesToVoteQueryKeyParams = {
  neo3Network: TNetwork<'neo3'>
}

type TBuildVoteNeo3GetVoteDetailsByAddressQueryKeyParams = {
  neo3Network: TNetwork<'neo3'>
  address?: string
}

type TBuildVoteNeo3CalculateVoteFeeQueryKeyParams = {
  neo3Network: TNetwork<'neo3'>
  candidatePubKey: string
  neo3Account?: IAccountState
}

type TUseVoteNeo3GetVoteDetailsByAddressesParam = { address: string }

const buildVoteNeo3GetCandidatesToVoteQueryKey = ({
  neo3Network,
}: TBuildVoteNeo3GetCandidatesToVoteQueryKeyParams): any[] => ['vote-neo3-get-candidates-to-vote', neo3Network]

export const buildVoteNeo3GetVoteDetailsByAddressQueryKey = ({
  neo3Network,
  address,
}: TBuildVoteNeo3GetVoteDetailsByAddressQueryKeyParams) => {
  const key: any[] = ['vote-neo3-get-vote-details-by-address', neo3Network]

  if (address) key.push(address)

  return key
}

const buildVoteNeo3CalculateVoteFeeQueryKey = ({
  neo3Network,
  candidatePubKey,
  neo3Account,
}: TBuildVoteNeo3CalculateVoteFeeQueryKeyParams) => {
  const key: any[] = ['vote-neo3-calculate-vote-fee', neo3Network]

  if (candidatePubKey) key.push(candidatePubKey)
  if (neo3Account) key.push(neo3Account)

  return key
}

export const useVoteNeo3GetCandidatesToVote = () => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQuery({
    queryKey: buildVoteNeo3GetCandidatesToVoteQueryKey({ neo3Network }),
    queryFn: () => blockchainService.voteService.getCandidatesToVote(),
    enabled: NetworkHelper.isMainnet('neo3', neo3Network),
  })
}

export const useVoteNeo3GetVoteDetailsByAddress = (address?: string) => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQuery({
    queryKey: buildVoteNeo3GetVoteDetailsByAddressQueryKey({ neo3Network, address }),
    queryFn: () => blockchainService.voteService.getVoteDetailsByAddress(address!),
    enabled: !!address && NetworkHelper.isMainnet('neo3', neo3Network),
  })
}

export const useVoteNeo3GetVoteDetailsByAddresses = (addresses: TUseVoteNeo3GetVoteDetailsByAddressesParam[]) => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQueries({
    queries: addresses.map(({ address }) => ({
      queryKey: buildVoteNeo3GetVoteDetailsByAddressQueryKey({ neo3Network, address }),
      queryFn: () => blockchainService.voteService.getVoteDetailsByAddress(address),
      enabled: NetworkHelper.isMainnet('neo3', neo3Network),
    })),
    combine: results => {
      const isLoading = results.some(result => result.isLoading)
      const data: GetVoteDetailsByAddressResponse[] = []

      if (!isLoading) {
        results.forEach(result => {
          if (!result.data) {
            return
          }
          data.push(result.data)
        })
      }

      return {
        isLoading,
        data,
      }
    },
  })
}

export const useVoteNeo3CalculateVoteFee = ({ neo3Account, candidatePubKey }: TCalculateVoteFeeParams) => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQuery({
    queryKey: buildVoteNeo3CalculateVoteFeeQueryKey({ neo3Network, candidatePubKey, neo3Account }),
    queryFn: async () => {
      const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: neo3Account!.encryptedKey!,
        encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
      })

      const account = AccountHelper.getServiceAccount({ account: neo3Account!, key })

      return await blockchainService.voteService.calculateVoteFee({ account, candidatePubKey })
    },
    enabled:
      neo3Account && neo3Account.type !== 'watch' && !!candidatePubKey && NetworkHelper.isMainnet('neo3', neo3Network),
    staleTime: 0,
    gcTime: 0,
  })
}

export const useVoteNeo3Validations = ({ balanceQuery, gasFee }: TValidationsParams) => {
  const service = bsAggregator.blockchainServicesByName.neo3

  const hasEnoughGasToPayFee = useMemo(() => {
    const gasAmountNumber = balanceQuery.data?.tokensBalances?.find(({ token }) =>
      service.tokenService.predicateByHash(service.feeToken, token)
    )?.amountNumber

    if (gasAmountNumber === undefined || gasFee === undefined) return undefined

    return gasAmountNumber >= NumberHelper.number(gasFee)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceQuery.data?.tokensBalances, gasFee])

  return { hasEnoughGasToPayFee }
}
