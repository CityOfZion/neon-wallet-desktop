import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

const DeeplinkManagerSetup = () => {
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'root.deeplinkManagerSetup' })

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

  return null
}

export default DeeplinkManagerSetup
