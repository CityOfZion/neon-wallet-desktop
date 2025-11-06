import {
  AbstractWalletConnectEIP155Adapter,
  type AbstractWalletConnectNeonAdapter,
  type TInitOptions,
} from '@cityofzion/wallet-connect-sdk-wallet-react'
import i18n from 'i18next'

import { bindApiFromMain } from '@cityofzion/bs-electron/dist/renderer'
import { COZ_WEBSITE_URL, NEON_ICONS_URL } from '@renderer/constants/urls'

export const walletConnectNeonAdapter = bindApiFromMain<AbstractWalletConnectNeonAdapter>('WalletConnectNeonAdapter')

export const walletConnectEIP155Adapter =
  bindApiFromMain<AbstractWalletConnectEIP155Adapter>('WalletConnectEIP155Adapter')

export const walletConnectOptions: TInitOptions = {
  clientOptions: {
    core: {
      projectId: '56de852a69580b46d61b53f7b3922ce1',
      relayUrl: 'wss://relay.walletconnect.com',
      logger: import.meta.env.DEV ? 'silent' : 'silent',
    },
    metadata: {
      name: i18n.t('common:walletConnect.name'),
      description: i18n.t('common:walletConnect.description'),
      url: COZ_WEBSITE_URL,
      icons: [`${NEON_ICONS_URL}/neon-logo/128x128.png`],
    },
    signConfig: {
      disableRequestQueue: true,
    },
  },
  blockchains: {
    neo3: {
      methods: [
        'invokeFunction',
        'testInvoke',
        'signMessage',
        'verifyMessage',
        'getWalletInfo',
        'traverseIterator',
        'getNetworkVersion',
        'encrypt',
        'decrypt',
        'decryptFromArray',
        'calculateFee',
        'signTransaction',
        'wipeRequests',
      ],
      autoAcceptMethods: [
        'testInvoke',
        'getWalletInfo',
        'traverseIterator',
        'getNetworkVersion',
        'calculateFee',
        'wipeRequests',
      ],
      adapter: walletConnectNeonAdapter,
    },
    eip155: {
      methods: [
        'personal_sign',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_sendTransaction',
        'eth_addEthereumChain',
        'eth_switchEthereumChain',
        'eth_call',
        'eth_requestAccounts',
        'eth_sendRawTransaction',
        'wallet_switchEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_addEthereumChain',
      ],
      autoAcceptMethods: [
        'eth_requestAccounts',
        'eth_addEthereumChain',
        'eth_switchEthereumChain',
        'wallet_switchEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_addEthereumChain',
      ],
      events: ['chainChanged', 'accountsChanged', 'disconnect', 'connect'],
      adapter: walletConnectEIP155Adapter,
    },
  },
}
