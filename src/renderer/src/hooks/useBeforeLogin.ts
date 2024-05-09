import { useEffect } from 'react'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch, useAppSelector } from './useRedux'
import { useNetworkTypeSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

export const useBeforeLogin = () => {
  const { ref: hasOverTheAirUpdatesRef } = useAppSelector(state => state.settings.hasOverTheAirUpdates)
  const { networkType } = useNetworkTypeSelector()
  const { walletsRef } = useWalletsSelector()
  const { deleteWallet } = useBlockchainActions()
  const dispatch = useAppDispatch()
  const { modalNavigate } = useModalNavigate()

  useEffect(() => {
    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      service.setNetwork({ type: networkType })
    })
  }, [networkType])

  useEffect(() => {
    walletsRef.current
      .filter(it => it.walletType === 'ledger')
      .forEach(wallet => {
        deleteWallet(wallet.id)
      })

    dispatch(accountReducerActions.removeAllPendingTransactions())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
