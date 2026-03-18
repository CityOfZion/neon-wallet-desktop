import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TSelectedNetworks } from '@shared/types/store'

import { useAppSelector } from './useRedux'

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

export const useSelectedWalletSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.selectedWallet)

  return {
    selectedWallet: value,
    selectedWalletRef: ref,
  }
}

export const useSelectedAccountSelector = () => {
  const { ref, value } = useAppSelector(state => state.settings.data.selectedAccount)

  return {
    selectedAccount: value,
    selectedAccountRef: ref,
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

export const useCanShowNeo3VoteSupportUsModalSelector = () => {
  const { value: canShowNeo3VoteSupportUsModal, ref: canShowNeo3VoteSupportUsModalRef } = useAppSelector(
    ({ settings }) => settings.data.canShowNeo3VoteSupportUsModal
  )

  return { canShowNeo3VoteSupportUsModal, canShowNeo3VoteSupportUsModalRef }
}

export const useShowSideBarSelector = () => {
  const { value: showSideBar, ref: showSideBarRef } = useAppSelector(({ settings }) => settings.data.showSideBar)

  return { showSideBar, showSideBarRef }
}

export const useShowNewsModalSelector = () => {
  const { value: showNewsModal, ref: showNewsModalRef } = useAppSelector(({ settings }) => settings.data.showNewsModal)

  return { showNewsModal, showNewsModalRef }
}
