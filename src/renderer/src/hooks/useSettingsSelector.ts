import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TSelectedNetworks } from '@shared/@types/store'

import { useAppDispatch, useAppSelector } from './useRedux'

export const useSelectedNetworkByBlockchainSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.selectedNetworkByBlockchain)
  return {
    networkByBlockchain: value,
    networkByBlockchainRef: ref,
  }
}

export const useSelectedNetworkSelector = <T extends TBlockchainServiceKey>(blockchain: T) => {
  const { ref, value } = useAppSelector(
    state => state.settings.data.selectedNetworkByBlockchain[blockchain] as TSelectedNetworks[T]
  )
  return {
    network: value,
    networkRef: ref,
  }
}

export const useNetworkProfilesSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.networkProfiles)
  return {
    networkProfiles: value,
    networkProfilesRef: ref,
  }
}

export const useSelectedNetworkProfileSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.selectedNetworkProfile)
  return {
    selectedNetworkProfile: value,
    selectedNetworkProfileRef: ref,
  }
}

export const useCustomNetworksSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.customNetworks)
  return {
    customNetworks: value,
    customNetworksRef: ref,
  }
}

export const useCurrencySelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.currency)
  return {
    currency: value,
    currencyRef: ref,
  }
}

export const useUnlockedSkinIdsSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.unlockedSkinIds)
  return {
    unlockedSkinIds: value,
    unlockedSkinIdsRef: ref,
  }
}

export const useLoginControlSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.encryptedLoginControl)
  return {
    encryptedLoginControl: value,
    encryptedLoginControlRef: ref,
  }
}

export const useHasPasswordSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.hasPassword)
  return {
    hasPassword: value,
    hasPasswordRef: ref,
  }
}

export const useIsFirstTimeSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.isFirstTime)
  return {
    isFirstTime: value,
    isFirstTimeRef: ref,
  }
}

export const useHasOverTheAirUpdatesSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.hasOverTheAirUpdates)
  return {
    hasOverTheAirUpdates: value,
    hasOverTheAirUpdatesRef: ref,
  }
}

export const useNetworkActions = () => {
  const dispatch = useAppDispatch()
  const { sessions, disconnect } = useWalletConnectWallet()

  const setNetwork = useCallback(
    async (blockchain: TBlockchainServiceKey, network: TNetwork<TBlockchainServiceKey>) => {
      await Promise.allSettled(sessions.map(session => disconnect(session)))
      dispatch(settingsReducerActions.setSelectNetwork({ blockchain, network }))
    },
    [disconnect, dispatch, sessions]
  ) as <T extends TBlockchainServiceKey>(blockchain: T, network: TNetwork<T>) => Promise<void>

  const setNetworkNode = useCallback(
    (blockchain: TBlockchainServiceKey, url: string, isAutomatic?: boolean) => {
      dispatch(settingsReducerActions.setSelectedNetworkUrl({ blockchain, url, isAutomatic }))
    },
    [dispatch]
  )

  return {
    setNetwork,
    setNetworkNode,
  }
}

export const useSettingsActions = () => {
  const dispatch = useDispatch()

  const setHasPassword = useCallback(
    async (password: string, isAlreadyEncrypted?: boolean) => {
      const encryptedPassword = !isAlreadyEncrypted ? await window.api.sendAsync('encryptBasedOS', password) : password

      const encryptedLoginControl = await window.api.sendAsync('encryptBasedEncryptedSecret', {
        value: LOGIN_CONTROL_VALUE,
        encryptedSecret: encryptedPassword,
      })

      dispatch(settingsReducerActions.setHasPassword(true))
      dispatch(settingsReducerActions.setEncryptedLoginControl(encryptedLoginControl))
      dispatch(authReducerActions.setCurrentLoginSession({ type: 'password', encryptedPassword }))
    },
    [dispatch]
  )

  return {
    setHasPassword,
  }
}
