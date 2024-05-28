import { useCallback } from 'react'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { TNetworkType } from '@renderer/@types/blockchain'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

import { useAppDispatch, useAppSelector } from './useRedux'

export const useEncryptedPasswordSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.encryptedPassword)
  return {
    encryptedPassword: value,
    encryptedPasswordRef: ref,
  }
}

export const useNetworkTypeSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.networkType)
  return {
    networkType: value,
    networkTypeRef: ref,
  }
}

export const useCurrencySelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.currency)
  return {
    currency: value,
    currencyRef: ref,
  }
}

export const useNetworkTypeActions = () => {
  const dispatch = useAppDispatch()
  const { sessions, disconnect } = useWalletConnectWallet()

  const handleChangeNetwork = useCallback(
    async (networkType: TNetworkType) => {
      await Promise.allSettled(sessions.map(session => disconnect(session)))
      dispatch(settingsReducerActions.setNetworkType(networkType))
    },
    [disconnect, dispatch, sessions]
  )

  return {
    handleChangeNetwork,
  }
}
