import { GateFiLangEnum, GateFiThemeType } from '@gatefi/js-sdk'

export const merchantId = import.meta.env.VITE_UNLIMIT_MERCHANT_ID
export const buyTokensIframeUrl = import.meta.env.VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL
export const sellTokensIframeUrl = import.meta.env.VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL
export const isConfigured = !!merchantId && !!buyTokensIframeUrl && !!sellTokensIframeUrl
export const lang = GateFiLangEnum.en_US
export const theme: GateFiThemeType = 'dark'
export const hideBrand = true
