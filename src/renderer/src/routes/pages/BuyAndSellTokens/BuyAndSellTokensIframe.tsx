import { ComponentProps, useEffect, useRef, useState } from 'react'

import type { WebviewTag } from 'electron'
import { useTranslation } from 'react-i18next'

import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

// React doesn't render boolean attributes it doesn't know, so the attribute is passed as a string
const WEBVIEW_ALLOW_POPUPS_ATTRIBUTE = { allowpopups: 'true' } as unknown as { allowpopups: boolean }

type TProps = { type: 'buy' | 'sell'; onReady?: (ready?: boolean) => void } & ComponentProps<'div'>

export const BuyAndSellTokensIframe = ({ type, onReady, className, ...props }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { currency } = useCurrencySelector()

  const webviewRef = useRef<WebviewTag>(null)

  // A new id is generated on every mount, so restarting the widget starts a new transaction
  const [url] = useState(() =>
    BuyAndSellTokensHelper.buildUrl({ type, currency, merchantTransactionId: UtilsHelper.uuid() })
  )
  const [hasError, setHasError] = useState(!url)

  useEffect(() => {
    const webview = webviewRef.current

    if (!webview) {
      onReady?.(true)
      return
    }

    onReady?.(undefined)

    const handleLoad = async () => {
      await SharedUtilsHelper.sleep(500)
      onReady?.(true)
    }

    const handleError = (event: Electron.DidFailLoadEvent) => {
      // -3 is ERR_ABORTED, triggered by in-page redirects
      if (!event.isMainFrame || event.errorCode === -3) return

      setHasError(true)
      onReady?.(true)
    }

    webview.addEventListener('did-finish-load', handleLoad)
    webview.addEventListener('did-fail-load', handleError)

    return () => {
      webview.removeEventListener('did-finish-load', handleLoad)
      webview.removeEventListener('did-fail-load', handleError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={StyleHelper.mergeStyles(
        'mx-auto h-full overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300/15',
        className
      )}
      {...props}
    >
      {hasError ? (
        <p className="mx-auto w-105 p-4 text-center text-xl text-white">{t('widgetError')}</p>
      ) : (
        // The Mercuryo widget refuses to be framed by the app, so a webview (a separate page) is used instead of an iframe
        <webview
          ref={webviewRef}
          src={url}
          // eslint-disable-next-line react/no-unknown-property
          partition="persist:mercuryo"
          {...WEBVIEW_ALLOW_POPUPS_ATTRIBUTE}
          className="h-full min-h-155 w-105 overflow-hidden rounded-lg"
        />
      )}
    </div>
  )
}
