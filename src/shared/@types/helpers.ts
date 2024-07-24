import { TBlockchainServiceKey, TNetworkIds } from './blockchain'

export type TWalletConnectHelperSessionInformation<T extends TBlockchainServiceKey = TBlockchainServiceKey> = {
  address: string
  blockchain: T
  network: TNetworkIds<T>
}

export type TWalletConnectHelperProposalInformation<T extends TBlockchainServiceKey = TBlockchainServiceKey> = {
  chain: string
  methods: string[]
  blockchain: T
  network: TNetworkIds<T>
  proposalBlockchain: string
}

export type TAccountHelperPredicateParams = {
  address: string
  blockchain: TBlockchainServiceKey
}
