import { useEffect } from 'react'

import { compareVersions } from 'compare-versions'
import { Trans, useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useOverTheAirInfoSelector } from '@renderer/hooks/useSettingsSelector'

import { LATEST_RELEASE_URL } from '@renderer/constants/urls'
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
              to={LATEST_RELEASE_URL}
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
