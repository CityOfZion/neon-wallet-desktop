import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { IAccountState } from '@renderer/@types/store'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useModalHistories, useModalNavigate } from './useModalRouter'

const useRegisterWalletConnectListeners = () => {
  const { sessions, requests } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { historiesRef } = useModalHistories()

  const watchRequests = useCallback(async () => {
    await UtilsHelper.sleep(1500)

    const currentHistory = historiesRef.current.slice(-1)[0]
    if (currentHistory && currentHistory.route.name === 'dapp-permission') {
      if (!requests.some(request => request.id === currentHistory.state?.request?.id)) {
        modalNavigate(-1)
      }

      return
    }

    if (requests.length <= 0) return
    const request = requests[0]

    const session = sessions.find(session => session.topic === request.topic)
    if (!session) return

    window.api.restoreWindow()
    modalNavigate('dapp-permission', { state: { session, request } })
  }, [requests, sessions, modalNavigate, historiesRef])

  useEffect(() => {
    watchRequests()
  }, [watchRequests])
}

const useRegisterLedgerListeners = () => {
  const { accountsRef } = useAccountsSelector()
  const { createWallet, importAccount, deleteWallet } = useBlockchainActions()
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { t } = useTranslation('hooks', { keyPrefix: 'useLedgerFlow' })

  useEffect(() => {
    const createLedgerWallet = async (address, publicKey, blockchain) => {
      const account = accountsRef.current.find(it => it.address === address)
      if (account) return

      const wallet = await createWallet({ name: commonT('ledgerName'), walletType: 'ledger' })
      await importAccount({ wallet, address, blockchain, type: 'ledger', key: publicKey })
    }

    const removeLedgerConnectedListener = window.electron.ipcRenderer.on(
      'ledgerConnected',
      async (_event, address, publicKey, blockchain) => {
        await createLedgerWallet(address, publicKey, blockchain)
      }
    )

    window.electron.ipcRenderer.invoke('getConnectedLedgers').then(async connectedLedgers => {
      await Promise.all(
        connectedLedgers.map(({ address, publicKey, blockchain }) => createLedgerWallet(address, publicKey, blockchain))
      )
    })

    return () => {
      removeLedgerConnectedListener()
    }
  }, [accountsRef, createWallet, deleteWallet, importAccount, commonT, t])
}

function isWalletConnectUri(uri) {
  return /^wc:.+@\d.*$/g.test(uri)
}

const useRegisterDeeplinkListeners = () => {
  const { modalNavigate } = useModalNavigate()
  const { t: commonWc } = useTranslation('hooks', { keyPrefix: 'DappConnection' })
  const [decodedDeeplinkUri, setDecodedDeeplinkUri] = useState<string | null>(null)

  const handleDeeplink = useCallback(async (uri: string) => {
    if (!uri) return

    await window.electron.ipcRenderer.invoke('restore')

    const realUri = uri.split('uri=').pop()
    if (!realUri) return

    const decodedUri = decodeURIComponent(realUri)
    if (isWalletConnectUri(decodedUri)) {
      setDecodedDeeplinkUri(decodedUri)
      return
    }

    const decodedBase64Uri = atob(decodedUri)
    if (isWalletConnectUri(decodedBase64Uri)) {
      setDecodedDeeplinkUri(decodedBase64Uri)
    }
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.invoke('getInitialDeepLinkUri').then(handleDeeplink)

    window.electron.ipcRenderer.once('deeplink', (_event, uri: string) => {
      handleDeeplink(uri)
    })
  }, [handleDeeplink])

  useEffect(() => {
    if (!decodedDeeplinkUri) return

    modalNavigate('select-account', {
      state: {
        onSelectAccount: (account: IAccountState) => {
          modalNavigate('dapp-connection', { state: { account: account, uri: decodedDeeplinkUri } })
          setDecodedDeeplinkUri(null)
        },
        title: commonWc('selectAccountModal.title'),
        buttonLabel: commonWc('selectAccountModal.selectSourceAccount'),
      },
    })
  }, [commonWc, decodedDeeplinkUri, modalNavigate])
}

export const useAfterLogin = () => {
  useRegisterWalletConnectListeners()
  useRegisterLedgerListeners()
  useRegisterDeeplinkListeners()
}
