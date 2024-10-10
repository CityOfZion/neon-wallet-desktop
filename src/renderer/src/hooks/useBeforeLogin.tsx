import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import {
  useHasOverTheAirUpdatesSelector,
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from './useSettingsSelector'

const useOverTheAirUpdate = () => {
  const { hasOverTheAirUpdatesRef } = useHasOverTheAirUpdatesSelector()
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
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      window.api.sendSync('restore')

      if (!currentLoginSessionRef.current)
        ToastHelper.info({
          message: t('pleaseLogin'),
        })
    }

    const removeListener = window.api.listen('deeplink', ({ args }) => handleDeeplink(args))
    window.api.sendAsync('getInitialDeepLinkUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [currentLoginSessionRef, t])
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

const useRemoveTemporaryApplicationData = () => {
  const dispatch = useAppDispatch()
  const { currentLoginSession } = useCurrentLoginSessionSelector()

  useEffect(() => {
    // If the user is logged in, we don't want to reset the temporary application data
    if (currentLoginSession) return

    dispatch(authReducerActions.resetTemporaryApplicationData())
  }, [currentLoginSession, dispatch])
}

export const useBeforeLogin = () => {
  useOverTheAirUpdate()
  useNetworkChange()
  useDeeplinkListeners()
  useRemoveTemporaryApplicationData()
}
