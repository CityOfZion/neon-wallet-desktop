import fingerprint from '@fingerprintjs/fingerprintjs'
import {
  GateFiDisplayModeEnum,
  GateFiEventTypes,
  GateFiLangEnum,
  GateFiSDK,
  type GateFiThemeType,
} from '@gatefi/js-sdk'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import type {
  TBuyAndSellTokensHelperGetSellUrlParams,
  TBuyAndSellTokensHelperInitBuyParams,
} from '@shared/types/helpers'
import type { TAvailableCurrency } from '@shared/types/store'

import { StyleHelper } from './StyleHelper'

export class BuyAndSellTokensHelper {
  static readonly sumsubTermsAndConditionsUrl = 'https://sumsub.com/terms-and-conditions'
  static readonly unlimitUseTermsUrl =
    'https://cdn.unlimit.com/site-crypto/wp-content/uploads/2023/11/24062357/Unl-Crypto_User-TC_.pdf'
  static readonly #defaultCurrencyLabel: TAvailableCurrency = 'USD'
  static readonly #supportedCurrencyLabels: TAvailableCurrency[] = ['USD', 'EUR', 'BRL', 'GBP']
  static readonly #lang = GateFiLangEnum.en_US
  static readonly #theme: GateFiThemeType = 'dark'
  static readonly #hideBrand = true

  static getValidCurrencyLabel(currencyLabel: TAvailableCurrency): TAvailableCurrency {
    return this.#supportedCurrencyLabels.includes(currencyLabel) ? currencyLabel : this.#defaultCurrencyLabel
  }

  static buildSellUrl({ currency, account }: TBuyAndSellTokensHelperGetSellUrlParams) {
    if (!SharedEnvHelper.VITE_UNLIMIT_MERCHANT_ID || !SharedEnvHelper.VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL) {
      return
    }

    const params = new URLSearchParams({
      merchantId: SharedEnvHelper.VITE_UNLIMIT_MERCHANT_ID,
      fiatCurrency: this.getValidCurrencyLabel(currency.label),
      lang: this.#lang,
      themeMode: this.#theme,
      hideBrand: String(this.#hideBrand),
      wallet: account?.address || '',
    })

    return `${SharedEnvHelper.VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL}?${params.toString()}`
  }

  static async initBuy({ currency, account, id }: TBuyAndSellTokensHelperInitBuyParams) {
    if (!SharedEnvHelper.VITE_UNLIMIT_MERCHANT_ID || !SharedEnvHelper.VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL) {
      return
    }

    const loadedFingerprint = await fingerprint.load()
    const result = await loadedFingerprint.get()

    const [colorNeon, colorAsphalt] = StyleHelper.getTheme('color-neon', 'color-asphalt')

    return await new Promise<() => void>(resolve => {
      const sdk = new GateFiSDK({
        merchantId: SharedEnvHelper.VITE_UNLIMIT_MERCHANT_ID!,
        displayMode: GateFiDisplayModeEnum.Embedded,
        nodeSelector: `#${id}`,
        lang: this.#lang,
        defaultFiat: { currency: BuyAndSellTokensHelper.getValidCurrencyLabel(currency.label) },
        hideThemeSwitcher: true,
        hideBrand: this.#hideBrand,
        fingerprint: result.visitorId,
        walletAddress: account?.address,
        styles: {
          type: this.#theme,
          primaryColor: colorNeon,
          primaryBackground: colorAsphalt,
          primaryTextColor: colorAsphalt,
          secondaryColor: colorNeon,
          secondaryBackground: colorAsphalt,
        },
      })

      sdk.subscribe(GateFiEventTypes.onLoad, async () => {
        await SharedUtilsHelper.sleep(500)
        resolve(() => {
          sdk.destroy()
        })
      })
    })
  }
}
