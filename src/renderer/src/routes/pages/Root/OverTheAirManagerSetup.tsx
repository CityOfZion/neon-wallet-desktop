import { useEffect } from 'react'

import { compareVersions } from 'compare-versions'
import { Trans, useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useOverTheAirInfoSelector } from '@renderer/hooks/useSettingsSelector'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

const OverTheAirManagerSetup = () => {
  const { overTheAirInfoRef } = useOverTheAirInfoSelector()
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('pages', { keyPrefix: 'root.overTheAirManagerSetup' })

  useEffect(() => {
    if (!overTheAirInfoRef.current.shouldUpdate || overTheAirInfoRef.current.hasUpdated) {
      return
    }

    const removeUpdateCompletedListener = window.api.listen('updater:updateCompleted', async () => {
      ToastHelper.dismiss('auto-update-downloading')

      const appVersion = window.api.sendSync('window:getVersion')

      dispatch(
        settingsReducerActions.setOverTheAirInfo({
          lastAppVersion: appVersion,
          hasUpdated: true,
        })
      )

      ToastHelper.success({ message: t('downloaded'), duration: 5000 })

      await SharedUtilsHelper.sleep(1000)

      window.api.sendAsync('updater:quitAndInstall')
    })

    const removeUpdateErrorListener = window.api.listen('updater:updateError', error => {
      ToastHelper.dismiss('auto-update-downloading')
      ToastHelper.error({ message: t('error'), duration: 5000 })
      LoggerHelper.sentry(error, { where: 'OverTheAirManagerSetup', operation: 'downloadUpdate' })
    })

    window.api.sendAsync('updater:checkForUpdates').then(hasUpdates => {
      if (!hasUpdates) return

      ToastHelper.loading({
        message: (
          <Trans t={t} i18nKey="downloading">
            start
            <span className="inline-block">middle</span>
            <Link
              to={ConstantsHelper.latestReleaseUrl}
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
    const currentAppVersion = window.api.sendSync('window:getVersion')

    if (!lastAppVersion) return

    if (compareVersions(currentAppVersion, lastAppVersion) === 0) {
      if (hasUpdated) {
        ToastHelper.info({ message: t('installError') })
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
  }, [overTheAirInfoRef, modalNavigate, dispatch, t])

  return null
}

export default OverTheAirManagerSetup
