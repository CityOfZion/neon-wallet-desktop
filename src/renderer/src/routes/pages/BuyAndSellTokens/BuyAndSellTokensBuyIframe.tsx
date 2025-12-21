import { ComponentProps, useRef } from 'react'

import fingerprint from '@fingerprintjs/fingerprintjs'
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK } from '@gatefi/js-sdk'

import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { useTheme } from '@renderer/hooks/useTheme'

import { buyTokensIframeUrl, hideBrand, lang, merchantId, theme } from '@renderer/constants/buy-and-sell-tokens'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import type { IAccountState } from '@shared/types/store'

type TProps = { account?: IAccountState; onReady?: (ready: boolean) => void } & ComponentProps<'div'>

const IFRAME_CONTAINER_ID = 'buy-tokens-iframe-container'

export const BuyAndSellTokensBuyIframe = ({ account, onReady, className, ...props }: TProps) => {
  const { currency } = useCurrencySelector()
  const [colorNeon, colorAsphalt] = useTheme('color-neon', 'color-asphalt')

  const gateFiSDK = useRef<GateFiSDK>(undefined)

  useMountUnsafe(async () => {
    onReady?.(false)

    if (gateFiSDK.current) {
      gateFiSDK.current.destroy()
    }

    const loadedFingerprint = await fingerprint.load()
    const result = await loadedFingerprint.get()
    const url = BuyAndSellTokensHelper.getMountedUrl({ domainUrl: buyTokensIframeUrl, currency, account })

    gateFiSDK.current = new GateFiSDK({
      merchantId,
      displayMode: GateFiDisplayModeEnum.Embedded,
      nodeSelector: `#${IFRAME_CONTAINER_ID}`,
      lang,
      defaultFiat: { currency: BuyAndSellTokensHelper.getValidCurrencyLabel(currency.label) },
      hideThemeSwitcher: true,
      hideBrand,
      redirectUrl: url,
      confirmRedirectUrl: url,
      successUrl: url,
      cancelUrl: url,
      declineUrl: url,
      inprocessUrl: url,
      fingerprint: result.visitorId,
      walletAddress: account?.address,
      styles: {
        type: theme,
        primaryColor: colorNeon,
        primaryBackground: colorAsphalt,
        primaryTextColor: colorAsphalt,
        secondaryColor: colorNeon,
        secondaryBackground: colorAsphalt,
      },
    })

    gateFiSDK.current.subscribe(GateFiEventTypes.onLoad, async () => {
      await SharedUtilsHelper.sleep(500)
      onReady?.(true)
    })
  })

  return (
    <div
      id={IFRAME_CONTAINER_ID}
      className={StyleHelper.mergeStyles(
        'h-full overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300/15 [&>iframe]:h-full! [&>iframe]:w-[420px]! [&>iframe]:border-0!',
        className
      )}
      {...props}
    />
  )
}
