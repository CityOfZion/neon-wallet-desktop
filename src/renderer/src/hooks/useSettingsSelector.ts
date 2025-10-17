import { useCallback } from 'react'

import { LOGIN_CONTROL_VALUE } from '@renderer/constants/password'
import { authReducerActions } from '@renderer/store/reducers/auth'
import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TSelectedNetworks } from '@shared/@types/store'

import { useAppDispatch, useAppSelector } from './useRedux'

export const useSelectedNetworkByBlockchainSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.selectedNetworkProfile.networkByBlockchain)
  return {
    networkByBlockchain: value,
    networkByBlockchainRef: ref,
  }
}

export const useSelectedNetworkSelector = <T extends TBlockchainServiceKey>(blockchain: T) => {
  const { ref, value } = useAppSelector(
    state => state.settings.data.selectedNetworkProfile.networkByBlockchain[blockchain] as TSelectedNetworks[T]
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

export const useLanguageSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.language)
  return {
    language: value,
    languageRef: ref,
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

export const useOverTheAirInfoSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.overTheAirInfo)
  return {
    overTheAirInfo: value,
    overTheAirInfoRef: ref,
  }
}

export const useSettingsActions = () => {
  const dispatch = useAppDispatch()

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

export const useCanShowVoteNeo3SupportUsModalSelector = () => {
  const { value: canShowVoteNeo3SupportUsModal, ref: canShowVoteNeo3SupportUsModalRef } = useAppSelector(
    ({ settings }) => settings.data.canShowVoteNeo3SupportUsModal
  )

  return { canShowVoteNeo3SupportUsModal, canShowVoteNeo3SupportUsModalRef }
}
