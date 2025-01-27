import { TSession, TSessionProposal, WalletConnectTypes } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { NETWORK_OPTIONS_BY_BLOCKCHAIN } from '@renderer/constants/networks'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TWalletConnectHelperProposalInformation, TWalletConnectHelperSessionInformation } from '@shared/@types/helpers'
import { IAccountState } from '@shared/@types/store'

export abstract class WalletConnectHelper {
  static supportedBlockchains: Partial<Record<TBlockchainServiceKey, string>> = {
    neo3: 'neo3',
    ethereum: 'eip155',
    neox: 'eip155',
    polygon: 'eip155',
    base: 'eip155',
  }

  static supportedChainIds = Object.keys(this.supportedBlockchains as TBlockchainServiceKey[]).reduce(
    (acc, key) => {
      const networks = NETWORK_OPTIONS_BY_BLOCKCHAIN[key].all

      acc[key] = networks.map(({ id }) => `${this.supportedBlockchains[key]}:${id}`)

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

  static getInformationFromProposal(
    proposal: TSessionProposal,
    account: IAccountState
  ): TWalletConnectHelperProposalInformation[] {
    let namespaces: WalletConnectTypes.ProposalTypes.BaseRequiredNamespace[]
    const requiredNamespaces = Object.values(proposal.params.requiredNamespaces)

    if (requiredNamespaces.length !== 0) {
      namespaces = requiredNamespaces
    } else {
      namespaces = Object.values(proposal.params.optionalNamespaces)
    }

    const blockchainSupportedChains = this.supportedChainIds[account.blockchain]
    if (!blockchainSupportedChains) return []

    const proposalInformation: TWalletConnectHelperProposalInformation[] = []

    for (const namespace of namespaces) {
      try {
        const namespaceChains = namespace.chains
        if (!namespaceChains) continue

        for (const namespaceChain of namespaceChains) {
          if (!blockchainSupportedChains.includes(namespaceChain)) continue

          const splitChainId = namespaceChain.split(':')

          proposalInformation.push({
            blockchain: account.blockchain,
            network: splitChainId[1],
            chain: namespaceChain,
            methods: namespace?.methods ?? [],
            proposalBlockchain: splitChainId[0],
          })
        }
      } catch {
        /* empty */
      }
    }

    return proposalInformation
  }

  static isValidURI(uri: string) {
    return /^wc:.+@\d.*$/g.test(uri)
  }
}
