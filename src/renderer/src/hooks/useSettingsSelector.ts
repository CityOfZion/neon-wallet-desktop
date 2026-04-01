import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TSelectedNetworks } from '@shared/types/store'

import { useAppSelector } from './useRedux'

export const useSelectedNetworkByBlockchainSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.selectedNetworkProfile.networkByBlockchain)

  return {
    networkByBlockchain: value,
    networkByBlockchainRef: ref,
  }
}

export const useSelectedNetworkSelector = <T extends TBlockchainServiceKey>(blockchain: T) => {
  const { value, ref } = useAppSelector(
    state => state.settings.data.selectedNetworkProfile.networkByBlockchain[blockchain] as TSelectedNetworks[T]
  )

  return {
    network: value,
    networkRef: ref,
  }
}

export const useNetworkProfilesSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.networkProfiles)

  return {
    networkProfiles: value,
    networkProfilesRef: ref,
  }
}

export const useSelectedNetworkProfileSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.selectedNetworkProfile)

  return {
    selectedNetworkProfile: value,
    selectedNetworkProfileRef: ref,
  }
}

export const useCustomNetworksSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.customNetworks)

  return {
    customNetworks: value,
    customNetworksRef: ref,
  }
}

export const useCurrencySelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.currency)

  return {
    currency: value,
    currencyRef: ref,
  }
}

export const useSelectedWalletSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.selectedWallet)

  return {
    selectedWallet: value,
    selectedWalletRef: ref,
  }
}

export const useSelectedAccountSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.selectedAccount)

  return {
    selectedAccount: value,
    selectedAccountRef: ref,
  }
}

export const useLanguageSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.language)

  return {
    language: value,
    languageRef: ref,
  }
}

export const useLoginControlSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.encryptedLoginControl)

  return {
    encryptedLoginControl: value,
    encryptedLoginControlRef: ref,
  }
}

export const useHasPasswordSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.hasPassword)

  return {
    hasPassword: value,
    hasPasswordRef: ref,
  }
}

export const useIsFirstTimeSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.isFirstTime)

  return {
    isFirstTime: value,
    isFirstTimeRef: ref,
  }
}

export const useOverTheAirInfoSelector = () => {
  const { value, ref } = useAppSelector(state => state.settings.data.overTheAirInfo)

  return {
    overTheAirInfo: value,
    overTheAirInfoRef: ref,
  }
}

export const useCanShowNeo3VoteSupportUsModalSelector = () => {
  const { value: canShowNeo3VoteSupportUsModal, ref: canShowNeo3VoteSupportUsModalRef } = useAppSelector(
    ({ settings }) => settings.data.canShowNeo3VoteSupportUsModal
  )

  return { canShowNeo3VoteSupportUsModal, canShowNeo3VoteSupportUsModalRef }
}

export const useShowSideBarSelector = () => {
  const { value: showSideBar, ref: showSideBarRef } = useAppSelector(({ settings }) => settings.memoryData.showSideBar)

  return { showSideBar, showSideBarRef }
}
