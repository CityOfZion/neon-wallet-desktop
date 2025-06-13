import { BSNeo3 } from '@cityofzion/bs-neo3'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'
import { useQuery } from '@tanstack/react-query'

type TCalculateVoteFeeParams = {
  neo3Account?: IAccountState
  candidatePubKey: string
}

export const useVoteNeo3GetCandidatesToVote = () => {
  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQuery({
    queryKey: ['vote-neo3-get-candidates-to-vote', neo3Network],
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
    queryKey: ['vote-neo3-get-vote-details-by-address', neo3Network, address],
    queryFn: () => blockchainService.voteService.getVoteDetailsByAddress(address!),
    enabled: !!address && NetworkHelper.isMainnet('neo3', neo3Network),
  })
}

export const useVoteNeo3CalculateVoteFee = ({ neo3Account, candidatePubKey }: TCalculateVoteFeeParams) => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const blockchainService = bsAggregator.blockchainServicesByName.neo3 as BSNeo3

  return useQuery({
    queryKey: ['vote-neo3-calculate-vote-fee', neo3Account, candidatePubKey, neo3Network],
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
