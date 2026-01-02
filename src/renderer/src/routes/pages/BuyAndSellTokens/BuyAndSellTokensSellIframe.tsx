import { ComponentProps, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { IAccountState } from '@shared/types/store'

type TProps = { account?: IAccountState; onReady?: (ready: boolean) => void; iframeId: string } & ComponentProps<'div'>

export const BuyAndSellTokensSellIframe = ({ account, onReady, className, iframeId, ...props }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { currency } = useCurrencySelector()

  const [hasIframeError, setHasIframeError] = useState(false)

  const url = BuyAndSellTokensHelper.buildSellUrl({ account, currency })

  const handleLoad = async () => {
    await SharedUtilsHelper.sleep(500)
    onReady?.(true)
  }

  const handleError = () => {
    setHasIframeError(true)
  }

  useMountUnsafe(() => {
    onReady?.(false)
  })

  return (
    <div
      className={StyleHelper.mergeStyles(
        'mx-auto h-full overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300/15',
        className
      )}
      {...props}
    >
      {hasIframeError ? (
        <p className="mx-auto p-4 text-center text-xl text-white">{t('widgetError')}</p>
      ) : (
        <iframe
          className="h-full! min-h-[620px]! w-[420px]! rounded-lg border-0!"
          src={`${url}&redirectUrl=${url}&confirmRedirectUrl${url}&reloadId=${iframeId}`}
          allow="clipboard-read; clipboard-write; payment"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
