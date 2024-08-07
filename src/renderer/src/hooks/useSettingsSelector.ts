import { useCallback } from 'react'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { TSelectedNetworks } from '@shared/@types/store'

import { useAppDispatch, useAppSelector } from './useRedux'

export const useEncryptedPasswordSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.encryptedPassword)
  return {
    encryptedPassword: value,
    encryptedPasswordRef: ref,
  }
}

export const useSelectedNetworkByBlockchainSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.selectedNetworkByBlockchain)
  return {
    networkByBlockchain: value,
    networkByBlockchainRef: ref,
  }
}

export const useSelectedNetworkSelector = <T extends TBlockchainServiceKey>(blockchain: T) => {
  const { ref, value } = useAppSelector(
    state => state.settings.selectedNetworkByBlockchain[blockchain] as TSelectedNetworks[T]
  )
  return {
    network: value,
    networkRef: ref,
  }
}

export const useNetworkProfilesSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.networkProfiles)
  return {
    networkProfiles: value,
    networkProfilesRef: ref,
  }
}

export const useSelectedNetworkProfileSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.selectedNetworkProfile)
  return {
    selectedNetworkProfile: value,
    selectedNetworkProfileRef: ref,
  }
}

export const useCustomNetworksSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.customNetworks)
  return {
    customNetworks: value,
    customNetworksRef: ref,
  }
}

export const useCurrencySelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.currency)
  return {
    currency: value,
    currencyRef: ref,
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

export const useUnlockedSkinIdsSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.unlockedSkinIds)
  return {
    unlockedSkinIds: value,
    unlockedSkinIdsRef: ref,
  }
}

export const useLoginControlSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.encryptedLoginControl)
  return {
    encryptedLoginControl: value,
    encryptedLoginControlRef: ref,
  }
}

export const useEncryptedPasswordActions = () => {
  const dispatch = useAppDispatch()

  const setEncryptedPassword = useCallback(
    async (password: string, isAlreadyEncrypted?: boolean) => {
      const encryptedPassword = isAlreadyEncrypted ? password : await window.api.sendAsync('encryptBasedOS', password)

      const encryptedLoginControl = await window.api.sendAsync('encryptBasedEncryptedSecret', {
        value: LOGIN_CONTROL_VALUE,
        encryptedSecret: encryptedPassword,
      })

      dispatch(settingsReducerActions.setEncryptedPassword(encryptedPassword))
      dispatch(settingsReducerActions.setEncryptedLoginControl(encryptedLoginControl))
      dispatch(settingsReducerActions.setSecurityType('password'))
    },
    [dispatch]
  )

  return {
    setEncryptedPassword,
  }
}
