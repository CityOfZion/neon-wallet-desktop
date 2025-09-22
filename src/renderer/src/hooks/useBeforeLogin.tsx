import { useEffect, useLayoutEffect, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from '@renderer/components/Link'
import { LATEST_GITHUB_RELEASE_LINK } from '@renderer/constants/urls'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { compareVersions } from 'compare-versions'
import i18next from 'i18next'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useMount } from './useMount'
import { useAllNodes } from './useNodes'
import { useAppDispatch } from './useRedux'
import {
  useLanguageSelector,
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

      await SharedUtilsHelper.sleep(1000)

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
        SharedUtilsHelper.sleep(1000).then(() => {
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
  const nodesQuery = useAllNodes()

  const nodesAlreadyChecked = useRef(false)

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

  useMount(async () => {
    if (nodesQuery.isLoading || !nodesQuery.data || nodesAlreadyChecked.current) return

    nodesAlreadyChecked.current = true

    const allNodes = nodesQuery.data

    const services = Object.values(bsAggregator.blockchainServicesByName)

    const promises = services.map(async service => {
      const currentNetwork = networkByBlockchain[service.name]

      try {
        await service.testNetwork(currentNetwork)
        return
      } catch {
        /* empty */
      }

      const newNode = allNodes[service.name].find(node => node.latency !== undefined && node.height !== undefined)
      if (!newNode) return

      dispatch(settingsReducerActions.setSelectedNetworkUrl({ blockchain: service.name, url: newNode.url }))

      dispatch(
        settingsReducerActions.saveNetworkProfile({
          ...selectedNetworkProfile,
          networkByBlockchain: {
            ...selectedNetworkProfile.networkByBlockchain,
            [service.name]: {
              ...currentNetwork,
              url: newNode.url,
            },
          },
        })
      )
    })

    await Promise.allSettled(promises)
  }, [nodesQuery.isLoading, nodesQuery.data])
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

const useLanguageChange = () => {
  const { language } = useLanguageSelector()

  useLayoutEffect(() => {
    i18next.changeLanguage(language.value)
  }, [language])
}

export const useBeforeLogin = () => {
  useLanguageChange()
  useOverTheAirUpdate()
  useNetworkChange()
  useDeeplinkListeners()
  useRemoveTemporaryApplicationData()
}
