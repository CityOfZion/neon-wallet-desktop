import { TSession, TSessionProposal } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { TBlockchainServiceKey, TNetworkType } from '@shared/@types/blockchain'
import { TWalletConnectHelperProposalInformation, TWalletConnectHelperSessionInformation } from '@shared/@types/helpers'
import { merge } from 'lodash'

export abstract class WalletConnectHelper {
  static blockchainsByBlockchainServiceKey: Partial<Record<TBlockchainServiceKey, string>> = {
    neo3: 'neo3',
    ethereum: 'eip155',
  }

  static networksByBlockchainServiceKey: Partial<Record<TBlockchainServiceKey, Record<TNetworkType, string>>> = {
    neo3: {
      mainnet: 'mainnet',
      testnet: 'testnet',
      custom: 'private',
    },
    ethereum: {
      mainnet: '1',
      testnet: '11155111',
      custom: '',
    },
  }

  static getAccountInformationFromSession(session: TSession): TWalletConnectHelperSessionInformation {
    const accounts = Object.values(session.namespaces)[0].accounts
    if (!accounts) throw new Error('Accounts not found')

    const account = accounts[0]
    const [sessionBlockchain, sessionNetwork, sessionAddress] = account.split(':')

    const blockchainByBlockchainServiceKey = Object.entries(this.blockchainsByBlockchainServiceKey).find(
      ([, value]) => value === sessionBlockchain
    )
    if (!blockchainByBlockchainServiceKey) throw new Error('Blockchain not supported')

    const blockchain = blockchainByBlockchainServiceKey[0] as TBlockchainServiceKey

    const networks = this.networksByBlockchainServiceKey[blockchain]
    if (!networks) throw new Error('Blockchain not supported')

    const networkByNetworkType = Object.entries(networks).find(entry => entry[1] === sessionNetwork)
    if (!networkByNetworkType) throw new Error('Network not supported')

    const network = networkByNetworkType[0] as TNetworkType

    return {
      address: sessionAddress,
      blockchain,
      network,
    }
  }

  static getInformationFromProposal(proposal: TSessionProposal): TWalletConnectHelperProposalInformation[] {
    const combinedNamespaces = merge({}, proposal.params.requiredNamespaces, proposal.params.optionalNamespaces)

    const proposalInformation = Object.values(combinedNamespaces).map((namespace: any) => {
      const chains = namespace.chains
      if (!chains) throw new Error('Chains not found')

      const methods = namespace?.methods ?? []
      const chain = chains[0]

      const [proposalBlockchain, proposalNetwork] = chain.split(':')

      const blockchainByBlockchainServiceKey = Object.entries(this.blockchainsByBlockchainServiceKey).find(
        ([, value]) => value === proposalBlockchain
      )
      if (!blockchainByBlockchainServiceKey) throw new Error('Blockchain not supported')

      const blockchain = blockchainByBlockchainServiceKey[0] as TBlockchainServiceKey

      const networks = this.networksByBlockchainServiceKey[blockchain]
      if (!networks) throw new Error('Blockchain not supported')

      const networkByNetworkType = Object.entries(networks).find(entry => entry[1] === proposalNetwork)
      if (!networkByNetworkType) throw new Error('Network not supported')

      const network = networkByNetworkType[0] as TNetworkType

      return {
        blockchain,
        network,
        chain,
        methods,
        proposalBlockchain,
        proposalNetwork,
      }
    })

    return proposalInformation
  }

  static isValidURI(uri: string) {
    return /^wc:.+@\d.*$/g.test(uri)
  }
}
