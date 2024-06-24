import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { IAccountState } from '@renderer/@types/store'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useModalHistories, useModalNavigate } from './useModalRouter'
import { useMountUnsafe } from './useMount'
import { useWalletsSelector } from './useWalletSelector'

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
  const { walletsRef } = useWalletsSelector()
  const { createWallet, importAccount, editAccount } = useBlockchainActions()
  const { t: commonT } = useTranslation('common')

  const createLedgerWallet = useCallback(
    (address: string, publicKey: string, blockchain: TBlockchainServiceKey, vendorId: string) => {
      const account = accountsRef.current.find(it => it.address === address)

      if (!account) {
        const wallet =
          walletsRef.current.find(it => it.id === vendorId) ??
          createWallet({ name: commonT('wallet.ledgerName'), id: vendorId })

        importAccount({ wallet, address, blockchain, type: 'ledger', key: publicKey })
        return
      }

      editAccount({
        account,
        data: {
          type: 'ledger',
          key: publicKey,
        },
      })
    },
    [accountsRef, editAccount, walletsRef, createWallet, commonT, importAccount]
  )

  const convertLedgerToWatch = useCallback(
    (address: string) => {
      const account = accountsRef.current.find(it => it.address === address)
      if (!account) return

      editAccount({
        account,
        data: {
          type: 'watch',
        },
      })
    },
    [accountsRef, editAccount]
  )

  useMountUnsafe(() => {
    window.api.getConnectedLedgers().then(connectedLedgers => {
      accountsRef.current.forEach(async account => {
        if (account.type !== 'ledger') return

        const connectedLedger = connectedLedgers.find(it => it.address === account.address)
        if (!connectedLedger) {
          convertLedgerToWatch(account.address)
        }
      })

      connectedLedgers.forEach(({ address, publicKey, blockchain, vendorId }) =>
        createLedgerWallet(address, publicKey, blockchain, vendorId)
      )
    })
  })

  useEffect(() => {
    const removeLedgerConnectedListener = window.listeners.ledgerConnected(
      (_event, address, publicKey, blockchain, vendorId) => {
        createLedgerWallet(address, publicKey, blockchain, vendorId)
      }
    )

    const removeLedgerDisconnectedListener = window.listeners.ledgerDisconnected((_event, address) => {
      convertLedgerToWatch(address)
    })

    return () => {
      removeLedgerConnectedListener()
      removeLedgerDisconnectedListener()
    }
  }, [accountsRef, commonT, createLedgerWallet, convertLedgerToWatch])
}

const useRegisterDeeplinkListeners = () => {
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t: commonWc } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    const handleDeeplink = async (uri: string) => {
      if (!uri) return

      window.api.resetInitialDeeplink()

      if (uri === 'neon3://migration') {
        navigate('/app/settings/security/migrate-accounts')
        modalNavigate('migrate-accounts-step-2')
        return
      }

      const realWCUri = uri.split('uri=').pop()
      if (realWCUri) {
        let wcUri: string | undefined

        const decodedUri = decodeURIComponent(realWCUri)
        if (WalletConnectHelper.isValidURI(decodedUri)) {
          wcUri = decodedUri
        } else {
          const decodedBase64Uri = atob(decodedUri)
          if (WalletConnectHelper.isValidURI(decodedBase64Uri)) {
            wcUri = decodedBase64Uri
          }
        }

        if (wcUri) {
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

    window.api.getInitialDeepLinkUri().then(handleDeeplink)

    const removeDeeplinkListener = window.listeners.deeplink((_event, uri: string) => {
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
