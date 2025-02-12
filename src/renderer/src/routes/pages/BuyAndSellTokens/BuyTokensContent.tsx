import { Dispatch, useRef, useState } from 'react'
import fingerprint from '@fingerprintjs/fingerprintjs'
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK } from '@gatefi/js-sdk'
import { buyTokensIframeUrl, hideBrand, lang, merchantId, theme } from '@renderer/constants/buy-and-sell-tokens'
import { BuyAndsellTokensHelper } from '@renderer/helpers/BuyAndsellTokensHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { BuyAndSellTokensLayout } from '@renderer/layouts/BuyAndSellTokensLayout'
import { IAccountState } from '@shared/@types/store'
import { theme as tailwindTheme } from '@shared/libs/theme'

import { BuyAndSellTokensScreenType } from './index'

type TProps = {
  hidden: boolean
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  account?: IAccountState
}

const NEON_COLOR = tailwindTheme.colors.neon.DEFAULT
const ASPHALT_COLOR = tailwindTheme.colors.asphalt.DEFAULT

export const BuyTokensContent = ({ hidden, account, setScreenType }: TProps) => {
  const { currency } = useCurrencySelector()
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const iframeInstanceRef = useRef<GateFiSDK>()

  const iframeId = 'buy-tokens-iframe'

  const initIframe = async () => {
    setIsIframeLoading(true)

    if (iframeInstanceRef.current) iframeInstanceRef.current.destroy()

    const loadedFingerprint = await fingerprint.load()
    const result = await loadedFingerprint.get()

    iframeInstanceRef.current = new GateFiSDK({
      merchantId,
      displayMode: GateFiDisplayModeEnum.Embedded,
      nodeSelector: `#${iframeId}`,
      lang,
      defaultFiat: { currency: BuyAndsellTokensHelper.getValidCurrencyLabel(currency.label) },
      hideThemeSwitcher: true,
      hideBrand,
      redirectUrl: BuyAndsellTokensHelper.getMountedUrl({ domainUrl: buyTokensIframeUrl, currency, account }),
      fingerprint: result.visitorId,
      walletAddress: account?.address,
      styles: {
        type: theme,
        primaryColor: NEON_COLOR,
        primaryBackground: ASPHALT_COLOR,
        primaryTextColor: ASPHALT_COLOR,
        secondaryColor: NEON_COLOR,
        secondaryBackground: ASPHALT_COLOR,
      },
    })

    iframeInstanceRef.current.subscribe(GateFiEventTypes.onLoad, async () => {
      await UtilsHelper.sleep(4000)

      setIsIframeLoading(false)
    })
  }

  useMountUnsafe(() => {
    initIframe()
  })

  return (
    <BuyAndSellTokensLayout
      hidden={hidden}
      isLoading={isIframeLoading}
      screenType={BuyAndSellTokensScreenType.BUY_TOKENS}
      setScreenType={setScreenType}
      account={account}
    >
      <div id={iframeId} className="buy-and-sell-tokens-iframe-container my-4 mx-auto" />
    </BuyAndSellTokensLayout>
  )
}
