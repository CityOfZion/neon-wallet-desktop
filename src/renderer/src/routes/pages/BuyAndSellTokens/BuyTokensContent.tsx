import { ComponentProps, Dispatch, useRef, useState } from 'react'

import fingerprint from '@fingerprintjs/fingerprintjs'
import { GateFiDisplayModeEnum, GateFiEventTypes, GateFiSDK } from '@gatefi/js-sdk'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { useTheme } from '@renderer/hooks/useTheme'

import { BuyAndSellTokensLayout } from '@renderer/layouts/BuyAndSellTokensLayout'

import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'

import { buyTokensIframeUrl, hideBrand, lang, merchantId, theme } from '@renderer/constants/buy-and-sell-tokens'
import { IAccountState } from '@shared/@types/store'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { BuyAndSellTokensScreenType } from './index'

type TProps = {
  hidden: boolean
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  account?: IAccountState
} & ComponentProps<'section'>

export const BuyTokensContent = ({ hidden, account, setScreenType, ...props }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyTokensContent' })
  const { currency } = useCurrencySelector()

  const [colorNeon, colorAsphalt] = useTheme('color-neon', 'color-asphalt')

  const [isIframeLoading, setIsIframeLoading] = useState(true)

  const iframeInstanceRef = useRef<GateFiSDK>(undefined)

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
        primaryColor: colorNeon,
        primaryBackground: colorAsphalt,
        primaryTextColor: colorAsphalt,
        secondaryColor: colorNeon,
        secondaryBackground: colorAsphalt,
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
          leftIcon={<MdRestartAlt aria-hidden className="h-5 min-h-5 w-5 min-w-5" />}
          onClick={handleRestart}
        />
      }
      {...props}
    >
      <div
        id={iframeId}
        className="mx-auto my-4 overflow-x-hidden overflow-y-auto [&>iframe]:h-[680px]! [&>iframe]:w-[420px]! [&>iframe]:rounded-lg [&>iframe]:border-0!"
      />
    </BuyAndSellTokensLayout>
  )
}
