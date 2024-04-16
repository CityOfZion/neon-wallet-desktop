import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useModalNavigate } from './useModalRouter'

const useRegisterWalletConnectListeners = () => {
  const { sessions, requests } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()

  useEffect(() => {
    if (requests.length <= 0) return
    const request = requests[0]

    const session = sessions.find(session => session.topic === request.topic)
    if (!session) return

    window.api.restoreWindow()
    modalNavigate('dapp-permission', { state: { session, request } })
  }, [requests, sessions, modalNavigate])
}

const useRegisterLedgerListeners = () => {
  const { accountsRef } = useAccountsSelector()
  const { createWallet, importAccount, deleteWallet } = useBlockchainActions()
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { t } = useTranslation('hooks', { keyPrefix: 'useLedgerFlow' })

  useEffect(() => {
    window.electron.ipcRenderer.on('ledgerConnected', async (_event, address, publicKey, blockchain) => {
      ToastHelper.success({
        message: t('ledgerConnected', { address: StringHelper.truncateStringMiddle(address, 20) }),
      })
      const wallet = await createWallet({ name: commonT('ledgerName'), walletType: 'ledger' })
      await importAccount({ wallet, address, blockchain, type: 'ledger', key: publicKey })
    })

    window.electron.ipcRenderer.on('ledgerDisconnected', (_event, address) => {
      const account = accountsRef.current.find(it => it.address === address)
      if (!account) return
      ToastHelper.error({
        message: t('ledgerDisconnected', { address: StringHelper.truncateStringMiddle(address, 20) }),
      })
      deleteWallet(account.idWallet)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ledgerConnected')
      window.electron.ipcRenderer.removeAllListeners('ledgerDisconnected')
    }
  }, [accountsRef, createWallet, deleteWallet, importAccount, commonT, t])

  useEffect(() => {
    window.electron.ipcRenderer.send('startLedger')
  }, [])
}

export const useAfterLogin = () => {
  useRegisterWalletConnectListeners()
  useRegisterLedgerListeners()
}
