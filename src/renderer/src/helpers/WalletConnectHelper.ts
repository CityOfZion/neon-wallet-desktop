import { TSession, TSessionProposal } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { NETWORK_OPTIONS_BY_BLOCKCHAIN } from '@renderer/constants/networks'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TWalletConnectHelperProposalInformation, TWalletConnectHelperSessionInformation } from '@shared/@types/helpers'
import { merge } from 'lodash'

export abstract class WalletConnectHelper {
  static supportedBlockchains: Partial<Record<TBlockchainServiceKey, string>> = {
    neo3: 'neo3',
    ethereum: 'eip155',
    neox: 'eip155',
  }

  static supportedChainIds = Object.keys(this.supportedBlockchains as TBlockchainServiceKey[]).reduce(
    (acc, key) => {
      const networks = NETWORK_OPTIONS_BY_BLOCKCHAIN[key].all
      const chainIds = networks.map(({ id }) => `${this.supportedBlockchains[key]}:${id}`)
      acc[key] = chainIds
      return acc
    },
    {} as Partial<Record<TBlockchainServiceKey, string[]>>
  )

  static getAccountInformationFromSession(session: TSession): TWalletConnectHelperSessionInformation {
    const accounts = Object.values(session.namespaces)[0].accounts
    if (!accounts) throw new Error('Accounts not found')

    const account = accounts[0]
    const [sessionBlockchain, sessionNetwork, sessionAddress] = account.split(':')

    const chainId = `${sessionBlockchain}:${sessionNetwork}`

    let blockchain: TBlockchainServiceKey | undefined
    let network: string | undefined

    for (const supportedChainIds of Object.entries(this.supportedChainIds)) {
      const [key, chainIds] = supportedChainIds

      if (chainIds.includes(chainId)) {
        const splitChainId = chainId.split(':')
        network = splitChainId[1]
        blockchain = key as TBlockchainServiceKey
        break
      }
    }

    if (!blockchain || !network) throw new Error('Chain not supported')

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

      const chainId = chains[0]

      let proposalBlockchain: string | undefined
      let blockchain: TBlockchainServiceKey | undefined
      let network: string | undefined

      for (const supportedChainIds of Object.entries(this.supportedChainIds)) {
        const [key, chainIds] = supportedChainIds
        if (chainIds.includes(chainId)) {
          const splitChainId = chainId.split(':')
          proposalBlockchain = splitChainId[0]
          network = splitChainId[1]
          blockchain = key as TBlockchainServiceKey
          break
        }
      }

      if (!blockchain || !network || !proposalBlockchain) throw new Error('Chain not supported')

      return {
        blockchain,
        network,
        chain: chainId,
        methods,
        proposalBlockchain,
      }
    })

    return proposalInformation
  }

  static isValidURI(uri: string) {
    return /^wc:.+@\d.*$/g.test(uri)
  }
}
