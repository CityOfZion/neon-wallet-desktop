import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { t: commonWc } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    // handleDeeplink function is inside useEffect
    const handleDeeplink = async (uri: string) => {
      if (!uri) return

      window.electron.ipcRenderer.invoke('resetInitialDeeplink')

      if (uri === 'neon3://migration') {
        // Navigate to migration screen
        navigate('/app/settings/security/migrate-accounts')
        // Navigation directly within the handleDeeplink function instead of set a state
        modalNavigate('migrate-accounts-step-2')
        return
      }

      const realWCUri = uri.split('uri=').pop()
      if (realWCUri) {
        let wcUri: string | undefined

        const decodedUri = decodeURIComponent(realWCUri)
        if (isWalletConnectUri(decodedUri)) {
          wcUri = decodedUri
        } else {
          const decodedBase64Uri = atob(decodedUri)
          if (isWalletConnectUri(decodedBase64Uri)) {
            wcUri = decodedBase64Uri
          }
        }

        if (wcUri) {
          // Navigation directly within the handleDeeplink function instead of set a state
          modalNavigate('select-account', {
            state: {
              onSelectAccount: (account: IAccountState) => {
                modalNavigate('dapp-connection', { state: { account: account, uri: wcUri } })
              },
              title: commonWc('selectAccountModal.title'),
              buttonLabel: commonWc('selectAccountModal.selectSourceAccount'),
            },
          })
        }
      }
    }

    window.electron.ipcRenderer.invoke('getInitialDeepLinkUri').then(handleDeeplink)

    const removeDeeplinkListener = window.electron.ipcRenderer.on('deeplink', (_event, uri: string) => {
      handleDeeplink(uri)
    })

    return () => {
      removeDeeplinkListener()
    }
  }, [commonWc, modalNavigate, navigate])
}

export const useAfterLogin = () => {
  useRegisterWalletConnectListeners()
  useRegisterLedgerListeners()
  useRegisterDeeplinkListeners()
}
