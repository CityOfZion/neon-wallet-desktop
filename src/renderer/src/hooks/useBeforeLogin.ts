import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch, useAppSelector } from './useRedux'
import { useSelectedNetworkByBlockchainSelector, useSelectedNetworkProfileSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

const useRegisterLedgerListeners = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useLedgerFlow' })
  const { deleteWallet } = useBlockchainActions()
  const { accountsRef } = useAccountsSelector()

  useEffect(() => {
    const removeLedgerConnectedListener = window.electron.ipcRenderer.on('ledgerConnected', async (_event, address) => {
      ToastHelper.success({
        message: t('ledgerConnected', { address: StringHelper.truncateStringMiddle(address, 20) }),
      })
    })

    const removeLedgerDisconnectedListener = window.electron.ipcRenderer.on('ledgerDisconnected', (_event, address) => {
      ToastHelper.error({
        message: t('ledgerDisconnected', { address: StringHelper.truncateStringMiddle(address, 20) }),
      })

      const account = accountsRef.current.find(it => it.address === address)
      if (!account) return
      deleteWallet(account.idWallet)
    })

    window.electron.ipcRenderer.send('startLedger')

    return () => {
      removeLedgerConnectedListener()
      removeLedgerDisconnectedListener()
    }
  }, [t, deleteWallet, accountsRef])
}

const useOverTheAirUpdate = () => {
  const { ref: hasOverTheAirUpdatesRef } = useAppSelector(state => state.settings.hasOverTheAirUpdates)
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    window.electron.ipcRenderer.on('updateCompleted', () => {
      dispatch(settingsReducerActions.setHasOverTheAirUpdates(true))
      window.api.quitAndInstall()
    })

    window.api.checkForUpdates()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('updateCompleted')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (hasOverTheAirUpdatesRef.current) {
      modalNavigate('auto-update-completed')
    }
  }, [modalNavigate, hasOverTheAirUpdatesRef])
}

const useDeeplinkListeners = () => {
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()
  const { t } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    // handleDeeplink function is inside useEffect
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      await window.electron.ipcRenderer.invoke('restore')

      // It means the user is not logged in
      // Toast directly within the handleDeeplink function instead of set a state
      if (!encryptedPasswordRef.current)
        ToastHelper.info({
          message: t('pleaseLogin'),
        })
    }

    // Listen to deeplink event
    const removeListener = window.electron.ipcRenderer.on('deeplink', (_event, uri) => handleDeeplink(uri))
    window.electron.ipcRenderer.invoke('getInitialDeepLinkUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [t, encryptedPasswordRef])
}
const useNetworkChange = () => {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  useLayoutEffect(() => {
    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      const network = networkByBlockchain[service.blockchainName]
      service.setNetwork({ type: network.type, url: network.url })
    })
  }, [networkByBlockchain])
}

const useStoreStartup = () => {
  const { walletsRef } = useWalletsSelector()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { deleteWallet } = useBlockchainActions()
  const dispatch = useAppDispatch()

  useEffect(() => {
    walletsRef.current
      .filter(it => it.walletType === 'ledger')
      .forEach(wallet => {
        deleteWallet(wallet.id)
      })

    dispatch(accountReducerActions.removeAllPendingTransactions())

    Object.entries(selectedNetworkProfile.networkByBlockchain).forEach(([blockchain, network]) => {
      dispatch(settingsReducerActions.setSelectNetwork({ blockchain: blockchain as TBlockchainServiceKey, network }))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useBeforeLogin = () => {
  useRegisterLedgerListeners()
  useOverTheAirUpdate()
  useNetworkChange()
  useStoreStartup()
  useDeeplinkListeners()
}
