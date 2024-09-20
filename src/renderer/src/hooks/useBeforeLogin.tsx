import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { useAccountsSelector } from './useAccountSelector'
import { usePersistStore } from './usePersistStore'
import { useAppDispatch, useAppSelector } from './useRedux'
import {
  useLoginSessionSelector,
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from './useSettingsSelector'

const useWalletConnectListeners = () => {
  const { accountsRef } = useAccountsSelector()
  const { loginSessionRef } = useLoginSessionSelector()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()

  useEffect(() => {
    const removeGetStoreFromWCListener = window.api.listen('getStoreFromWC', ({ args }) => {
      const info = WalletConnectHelper.getAccountInformationFromSession(args)
      const account = accountsRef.current.find(AccountHelper.predicate(info))

      window.api.sendSync('sendStoreFromWC', {
        account,
        encryptedPassword: loginSessionRef.current?.encryptedPassword,
        networkByBlockchain: networkByBlockchainRef.current,
      })
    })

    return () => {
      removeGetStoreFromWCListener()
    }
  }, [accountsRef, loginSessionRef, networkByBlockchainRef])
}

const useOverTheAirUpdate = () => {
  const { ref: hasOverTheAirUpdatesRef } = useAppSelector(state => state.settings.hasOverTheAirUpdates)
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useOverTheAirUpdate' })

  useEffect(() => {
    const removeUpdateCompletedListener = window.api.listen('updateCompleted', async () => {
      ToastHelper.dismiss('auto-update-downloading')

      dispatch(settingsReducerActions.setHasOverTheAirUpdates(true))

      ToastHelper.success({ message: t('downloaded'), duration: 5000 })

      await UtilsHelper.sleep(1000)

      window.api.sendAsync('quitAndInstall')
    })

    window.api.sendAsync('checkForUpdates').then(hasUpdates => {
      if (!hasUpdates) return
      ToastHelper.loading({ message: t('downloading'), id: 'auto-update-downloading' })
    })

    return () => {
      removeUpdateCompletedListener()
    }
  }, [dispatch, t])

  useEffect(() => {
    if (hasOverTheAirUpdatesRef.current) {
      modalNavigate('auto-update-completed')
    }
  }, [hasOverTheAirUpdatesRef, modalNavigate])
}

const useDeeplinkListeners = () => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      window.api.sendSync('restore')

      if (!loginSessionRef.current)
        ToastHelper.info({
          message: t('pleaseLogin'),
        })
    }

    const removeListener = window.api.listen('deeplink', ({ args }) => handleDeeplink(args))
    window.api.sendAsync('getInitialDeepLinkUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [loginSessionRef, t])
}

const useNetworkChange = () => {
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const dispatch = useAppDispatch()

  useLayoutEffect(() => {
    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      const network = networkByBlockchain[service.blockchainName]
      service.setNetwork(network)
    })
  }, [networkByBlockchain])

  useLayoutEffect(() => {
    Object.entries(selectedNetworkProfile.networkByBlockchain).forEach(([blockchain, network]) => {
      dispatch(settingsReducerActions.setSelectNetwork({ blockchain: blockchain as TBlockchainServiceKey, network }))
    })
  }, [dispatch, selectedNetworkProfile.networkByBlockchain])
}

const useWindowListeners = () => {
  const { resume } = usePersistStore()
  const dispatch = useAppDispatch()
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('hooks', { keyPrefix: 'useBeforeLogin' })

  useEffect(() => {
    const removeWillQuitListener = window.api.listen('willCloseWindow', async () => {
      dispatch(accountReducerActions.removeAllPendingTransactions())

      if (loginSessionRef.current?.type === 'hardware') {
        await resume()

        // Await for the store to be hydrated and saved to the local storage
        ToastHelper.loading({ message: t('waitSave'), position: 'top-center' })
        await UtilsHelper.sleep(6000)
      }

      window.api.sendSync('closeWindow')
    })

    return () => {
      removeWillQuitListener()
    }
  }, [dispatch, loginSessionRef, resume, t])
}

export const useBeforeLogin = () => {
  useOverTheAirUpdate()
  useNetworkChange()
  useWindowListeners()
  useDeeplinkListeners()
  useWalletConnectListeners()
}
