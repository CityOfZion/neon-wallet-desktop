import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

const DeeplinkManagerSetup = () => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'root.deeplinkManagerSetup' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      window.api.sendSync('window:restore')

      if (!loginSessionRef.current)
        ToastHelper.info({
          message: t('pleaseLogin'),
        })
    }

    const removeListener = window.api.listen('deeplink:connection', ({ args }) => handleDeeplink(args))
    window.api.sendAsync('deeplink:getInitialUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [loginSessionRef, t])

  return null
}

export default DeeplinkManagerSetup
