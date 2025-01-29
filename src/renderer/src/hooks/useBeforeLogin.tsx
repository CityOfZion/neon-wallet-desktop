import { useEffect, useLayoutEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@renderer/components/Link'
import { LATEST_GITHUB_RELEASE_LINK } from '@renderer/constants/urls'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { compareVersions } from 'compare-versions'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import {
  useOverTheAirInfoSelector,
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from './useSettingsSelector'

const useOverTheAirUpdate = () => {
  const { overTheAirInfoRef } = useOverTheAirInfoSelector()
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useOverTheAirUpdate' })

  useEffect(() => {
    if (!overTheAirInfoRef.current.shouldUpdate || overTheAirInfoRef.current.hasUpdated) {
      return
    }

    const removeUpdateCompletedListener = window.api.listen('updateCompleted', async () => {
      ToastHelper.dismiss('auto-update-downloading')

      const appVersion = window.api.sendSync('getVersion')

      dispatch(
        settingsReducerActions.setOverTheAirInfo({
          lastAppVersion: appVersion,
          hasUpdated: true,
        })
      )

      ToastHelper.success({ message: t('downloaded'), duration: 5000 })

      await UtilsHelper.sleep(1000)

      window.api.sendAsync('quitAndInstall')
    })

    const removeUpdateErrorListener = window.api.listen('updateError', error => {
      ToastHelper.dismiss('auto-update-downloading')
      ToastHelper.error({ message: t('error'), duration: 5000 })
      console.error(error)
    })

    window.api.sendAsync('checkForUpdates').then(hasUpdates => {
      if (!hasUpdates) return

      ToastHelper.loading({
        message: (
          <Trans t={t} i18nKey="downloading">
            start
            <span className="inline-block">middle</span>
            <Link
              to={LATEST_GITHUB_RELEASE_LINK}
              target="_blank"
              colorSchema="white"
              variant="text-slim"
              clickableProps={{ className: 'underline inline font-semibold' }}
            >
              end
            </Link>
          </Trans>
        ),
        id: 'auto-update-downloading',
      })
    })

    return () => {
      removeUpdateErrorListener()
      removeUpdateCompletedListener()
    }
  }, [dispatch, overTheAirInfoRef, t])

  useEffect(() => {
    const { lastAppVersion, hasUpdated } = overTheAirInfoRef.current
    const currentAppVersion = window.api.sendSync('getVersion')

    if (!lastAppVersion) return

    if (compareVersions(currentAppVersion, lastAppVersion) === 0) {
      if (hasUpdated) {
        // It is necessary to wait the app to be done to show the toast
        UtilsHelper.sleep(1000).then(() => {
          ToastHelper.info({
            message: t('installError'),
          })
        })
      }

      dispatch(settingsReducerActions.setOverTheAirInfo({ shouldUpdate: false, hasUpdated: false }))
      return
    }

    if (hasUpdated) {
      modalNavigate('auto-update-completed')
    }

    dispatch(
      settingsReducerActions.setOverTheAirInfo({
        shouldUpdate: true,
        hasUpdated: undefined,
        lastAppVersion: undefined,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overTheAirInfoRef, modalNavigate, dispatch])
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
      const network = networkByBlockchain[service.name]
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
