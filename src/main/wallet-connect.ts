import { IBlockchainService } from '@cityofzion/blockchain-service'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import {
  AbstractWalletConnectEIP155Adapter,
  AbstractWalletConnectNeonAdapter,
} from '@cityofzion/wallet-connect-sdk-wallet-core'
import type { TAdapterMethodParam, TCustomSigner, WalletInfo } from '@cityofzion/wallet-connect-sdk-wallet-react'

import { exposeApiToRenderer } from '@cityofzion/bs-electron/dist/main'
import { mainApi } from '@shared/api/main'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TGetStoreFromWCSession } from '@shared/types/ipc'
import { IAccountState } from '@shared/types/store'

import { bsAggregator, getHardwareWalletTransport } from './blockchain-service'
import { decryptBasedEncryptedSecret } from './encryption'

const getBip44DerivationPath = (account: IAccountState, service: IBlockchainService<TBlockchainServiceKey>) =>
  service.bip44DerivationPath.replace('?', account.order.toString())

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

    const key = decryptBasedEncryptedSecret({ value: account.encryptedKey, encryptedSecret: encryptedPassword })
    if (!key) throw new Error('Error to decrypt key')

    return key
  }

  async getWalletInfo(param: TAdapterMethodParam): Promise<WalletInfo> {
    const { account } = await getStoreAccountFromWCSession(param)
    if (!account) throw new Error('Account not found')

    return {
      isLedger: account.type === 'hardware',
    }
  }

  async getRPCUrl(param: TAdapterMethodParam): Promise<string> {
    const { networkByBlockchain } = await getStoreAccountFromWCSession(param)
    return networkByBlockchain.neo3.url
  }

  async getSigningCallback(param: TAdapterMethodParam) {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(param)
    if (!account) throw new Error('Account not found')

    if (account.type !== 'hardware') return undefined
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret({ value: account.encryptedKey, encryptedSecret: encryptedPassword })
    if (!key) throw new Error('Error to decrypt key')

    const service = bsAggregator.blockchainServicesByName.neo3 as BSNeo3<TBlockchainServiceKey>

    const serviceAccount = service.generateAccountFromPublicKey(key)

    serviceAccount.isHardware = true
    serviceAccount.bip44Path = getBip44DerivationPath(account, service)

    const transport = await getHardwareWalletTransport(serviceAccount)

    return service.ledgerService.getSigningCallback(transport, serviceAccount)
  }
}

export class WalletConnectEIP155Adapter extends AbstractWalletConnectEIP155Adapter {
  async getAccountString(params: TAdapterMethodParam): Promise<string> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(params)
    if (!account) throw new Error('Account not found')
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret({ value: account.encryptedKey, encryptedSecret: encryptedPassword })
    if (!key) throw new Error('Error to decrypt key')

    return key
  }

  async getRPCUrl(params: TAdapterMethodParam): Promise<string> {
    const { networkByBlockchain, account } = await getStoreAccountFromWCSession(params)
    if (!account) throw new Error('Account not found')

    return networkByBlockchain[account.blockchain].url
  }

  async getCustomSigner(params: TAdapterMethodParam): Promise<TCustomSigner | undefined> {
    const { account, encryptedPassword } = await getStoreAccountFromWCSession(params)
    if (!account) throw new Error('Account not found')

    if (account.type !== 'hardware') return undefined
    if (!account.encryptedKey) throw new Error('Key not found')

    const key = decryptBasedEncryptedSecret({ value: account.encryptedKey, encryptedSecret: encryptedPassword })
    if (!key) throw new Error('Error to decrypt key')

    const service = bsAggregator.blockchainServicesByName.ethereum as BSEthereum<TBlockchainServiceKey>

    const serviceAccount = service.generateAccountFromPublicKey(key)

    serviceAccount.isHardware = true
    serviceAccount.bip44Path = getBip44DerivationPath(account, service)

    const transport = await getHardwareWalletTransport(serviceAccount)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return service.ledgerService.getSigner(transport, serviceAccount.bip44Path)
  }
}

export function setupWalletConnectAdapters() {
  const walletConnectNeonAdapter = new WalletConnectNeonAdapter()
  const walletConnectEIP155Adapter = new WalletConnectEIP155Adapter()

  exposeApiToRenderer(walletConnectNeonAdapter)
  exposeApiToRenderer(walletConnectEIP155Adapter)
}
