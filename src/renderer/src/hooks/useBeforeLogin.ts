import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useAccountsSelector } from './useAccountSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch, useAppSelector } from './useRedux'
import { useNetworkTypeSelector } from './useSettingsSelector'
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
  const { t } = useTranslation('hooks', { keyPrefix: 'DappConnection' })
  const [hasDeeplink, setHasDeeplink] = useState<boolean>(false)

  const handleDeeplink = useCallback(async (hasUri: boolean) => {
    await window.electron.ipcRenderer.invoke('restore')
    setHasDeeplink(hasUri)
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.invoke('hasDeeplink').then(handleDeeplink)
  }, [handleDeeplink])

  useEffect(() => {
    if (hasDeeplink) {
      ToastHelper.info({
        message: t('pleaseLogin'),
      })
    }
  }, [hasDeeplink, t])
}
const useNetworkChange = () => {
  const { networkType } = useNetworkTypeSelector()

  useEffect(() => {
    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      service.setNetwork({ type: networkType })
    })
  }, [networkType])
}

const useStoreStartup = () => {
  const { walletsRef } = useWalletsSelector()
  const { deleteWallet } = useBlockchainActions()
  const dispatch = useAppDispatch()

  useEffect(() => {
    walletsRef.current
      .filter(it => it.walletType === 'ledger')
      .forEach(wallet => {
        deleteWallet(wallet.id)
      })

    dispatch(accountReducerActions.removeAllPendingTransactions())
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
