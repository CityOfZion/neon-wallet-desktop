import { ComponentProps, Dispatch, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdRestartAlt } from 'react-icons/md'
import fingerprint from '@fingerprintjs/fingerprintjs'
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK } from '@gatefi/js-sdk'
import { Button } from '@renderer/components/Button'
import { buyTokensIframeUrl, hideBrand, lang, merchantId, theme } from '@renderer/constants/buy-and-sell-tokens'
import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { BuyAndSellTokensLayout } from '@renderer/layouts/BuyAndSellTokensLayout'
import { IAccountState } from '@shared/@types/store'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { theme as tailwindTheme } from '@shared/libs/theme'

import { BuyAndSellTokensScreenType } from './index'

type TProps = {
  hidden: boolean
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  account?: IAccountState
} & ComponentProps<'section'>

const NEON_COLOR = tailwindTheme.colors.neon.DEFAULT
const ASPHALT_COLOR = tailwindTheme.colors.asphalt.DEFAULT

export const BuyTokensContent = ({ hidden, account, setScreenType, ...props }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyTokensContent' })
  const { currency } = useCurrencySelector()
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const iframeInstanceRef = useRef<GateFiSDK>()

  const iframeId = 'buy-tokens-iframe'

  const initIframe = async () => {
    setIsIframeLoading(true)

    if (iframeInstanceRef.current) iframeInstanceRef.current.destroy()

    const loadedFingerprint = await fingerprint.load()
    const result = await loadedFingerprint.get()
    const url = BuyAndSellTokensHelper.getMountedUrl({ domainUrl: buyTokensIframeUrl, currency, account })

    iframeInstanceRef.current = new GateFiSDK({
      merchantId,
      displayMode: GateFiDisplayModeEnum.Embedded,
      nodeSelector: `#${iframeId}`,
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
        primaryColor: NEON_COLOR,
        primaryBackground: ASPHALT_COLOR,
        primaryTextColor: ASPHALT_COLOR,
        secondaryColor: NEON_COLOR,
        secondaryBackground: ASPHALT_COLOR,
      },
    })

    iframeInstanceRef.current.subscribe(GateFiEventTypes.onLoad, async () => {
      await SharedUtilsHelper.sleep(4000)

      setIsIframeLoading(false)
    })
  }

  const handleRestart = () => {
    initIframe()
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
      leftActions={
        <Button
          label={t('buttons.restart')}
          variant="text-slim"
          textClassName="font-normal"
          colorSchema={isIframeLoading ? 'gray' : 'neon'}
          disabled={isIframeLoading}
          leftIcon={<MdRestartAlt aria-hidden={true} />}
          onClick={handleRestart}
        />
      }
      {...props}
    >
      <div id={iframeId} className="buy-and-sell-tokens-iframe-container my-4 mx-auto" />
    </BuyAndSellTokensLayout>
  )
}
