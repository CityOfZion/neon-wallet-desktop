import { useEffect } from 'react'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'

import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch } from './useRedux'
import { useNetworkTypeSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

export const useBeforeLogin = () => {
  const { networkType } = useNetworkTypeSelector()
  const { walletsRef } = useWalletsSelector()
  const { deleteWallet } = useBlockchainActions()
  const dispatch = useAppDispatch()

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
}
