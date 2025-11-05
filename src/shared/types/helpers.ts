import { TBlockchainServiceKey } from './blockchain'

export type TWalletConnectHelperSessionInformation<T extends TBlockchainServiceKey = TBlockchainServiceKey> = {
  address: string
  blockchain: T
  network: string
}

export type TWalletConnectHelperProposalInformation<T extends TBlockchainServiceKey = TBlockchainServiceKey> = {
  chain: string
  methods: string[]
  blockchain: T
  network: string
  proposalBlockchain: string
}

export type TAccountHelperPredicateParams = {
  address: string
  blockchain: TBlockchainServiceKey
}
