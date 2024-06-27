import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import * as NeonJs from '@cityofzion/neon-js'
import {
  AbstractWalletConnectEIP155Adapter,
  AbstractWalletConnectNeonAdapter,
} from '@cityofzion/wallet-connect-sdk-wallet-core'
import type { TAdapterMethodParam, TCustomSigner, WalletInfo } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { TGetStoreFromWCSession } from '@shared/@types/ipc'
import { mainApi } from '@shared/api/main'

import { bsAggregator } from './bsAggregator'
import { decryptBasedEncryptedSecret } from './encryption'
import { getLedgerTransport } from './ledger'

const getStoreAccountFromWCSession = async ({ session }: TAdapterMethodParam): Promise<TGetStoreFromWCSession> => {
  return new Promise(resolve => {
    mainApi.listenSync('sendStoreFromWC', ({ args, removeAllListeners }) => {
      resolve(args)
      removeAllListeners()
    })

    mainApi.send('getStoreFromWC', session)
  })
}

class WalletConnectNeonAdapter extends AbstractWalletConnectNeonAdapter {
  async getAccountString(param: TAdapterMethodParam): Promise<string> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(param)
    if (!account) throw new Error('Account not found')
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
    if (!key) throw new Error('Error to decrypt key')

    return key
  }

  async getWalletInfo(param: TAdapterMethodParam): Promise<WalletInfo> {
    const { account } = await getStoreAccountFromWCSession(param)
    if (!account) throw new Error('Account not found')

    return {
      isLedger: account.type === 'ledger',
    }
  }

  async getRPCUrl(param: TAdapterMethodParam): Promise<string> {
    const { networkByBlockchain } = await getStoreAccountFromWCSession(param)
    return networkByBlockchain.neo3.url
  }

  async getSigningCallback(param: TAdapterMethodParam): Promise<NeonJs.api.SigningFunction | undefined> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(param)
    if (!account) throw new Error('Account not found')

    if (account.type !== 'ledger') return undefined
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
    if (!key) throw new Error('Error to decrypt key')

    const service = bsAggregator.blockchainServicesByName.neo3 as BSNeo3
    const serviceAccount = service.generateAccountFromPublicKey(key)
    const transport = await getLedgerTransport(serviceAccount)

    return service.ledgerService.getSigningCallback(transport)
  }
}

export class WalletConnectEIP155Adapter extends AbstractWalletConnectEIP155Adapter {
  async getAccountString(params: TAdapterMethodParam): Promise<string> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(params)
    if (!account) throw new Error('Account not found')
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
    if (!key) throw new Error('Error to decrypt key')

    return key
  }

  async getRPCUrl(params: TAdapterMethodParam): Promise<string> {
    const { networkByBlockchain } = await getStoreAccountFromWCSession(params)
    return networkByBlockchain.ethereum.url
  }

  async getCustomSigner(params: TAdapterMethodParam): Promise<TCustomSigner | undefined> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(params)
    if (!account) throw new Error('Account not found')

    if (account.type !== 'ledger') return undefined
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
    if (!key) throw new Error('Error to decrypt key')

    const service = bsAggregator.blockchainServicesByName.ethereum as BSEthereum
    const serviceAccount = service.generateAccountFromPublicKey(key)
    const transport = await getLedgerTransport(serviceAccount)

    return service.ledgerService.getSigner(transport)
  }
}

export function exposeWalletConnectAdaptersToRenderer() {
  const walletConnectNeonAdapter = new WalletConnectNeonAdapter()
  const walletConnectEIP155Adapter = new WalletConnectEIP155Adapter()

  exposeApiToRenderer(walletConnectNeonAdapter)
  exposeApiToRenderer(walletConnectEIP155Adapter)
}
