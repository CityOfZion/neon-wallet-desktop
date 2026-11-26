import { useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

const DeeplinkManagerSetup = () => {
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'root.deeplinkManagerSetup' })

  // Keep latest `t` in a ref so changing the language doesn't re-run the effect
  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      window.api.sendSync('window:restore')

      if (!loginSessionRef.current)
        ToastHelper.info({
          message: tRef.current('pleaseLogin'),
        })
    }

    const removeListener = window.api.listen('deeplink:connection', ({ args }) => handleDeeplink(args))
    window.api.sendAsync('deeplink:getInitialUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [loginSessionRef])

  return null
}

export default DeeplinkManagerSetup
