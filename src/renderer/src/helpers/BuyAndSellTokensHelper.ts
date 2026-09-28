import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import type { TBuyAndSellTokensHelperBuildUrlParams } from '@shared/types/helpers'
import type { TAvailableCurrency } from '@shared/types/store'

export class BuyAndSellTokensHelper {
  static readonly sumsubTermsAndConditionsUrl = 'https://sumsub.com/terms-and-conditions'
  static readonly mercuryoUseTermsUrl = 'https://mercuryo.io/legal/terms'
  static readonly #widgetUrl = 'https://exchange.mercuryo.io'
  static readonly #defaultCurrencyLabel: TAvailableCurrency = 'USD'
  static readonly #supportedBuyCurrencyLabels: TAvailableCurrency[] = ['USD', 'EUR', 'BRL', 'GBP']
  static readonly #supportedSellCurrencyLabels: TAvailableCurrency[] = ['USD', 'EUR']
  static readonly #lang = 'en'

  static getValidCurrencyLabel(
    currencyLabel: TAvailableCurrency,
    supportedCurrencyLabels = this.#supportedBuyCurrencyLabels
  ): TAvailableCurrency {
    return supportedCurrencyLabels.includes(currencyLabel) ? currencyLabel : this.#defaultCurrencyLabel
  }

  static buildUrl({ type, currency, merchantTransactionId }: TBuyAndSellTokensHelperBuildUrlParams) {
    if (!SharedEnvHelper.VITE_MERCURYO_WIDGET_ID) return

    const supportedCurrencyLabels =
      type === 'sell' ? this.#supportedSellCurrencyLabels : this.#supportedBuyCurrencyLabels

    // The wallet address is not sent because Mercuryo requires it to be signed with the widget secret, which can't
    // be safely stored in the app. The user pastes the destination address in the widget instead.
    const params = new URLSearchParams({
      widget_id: SharedEnvHelper.VITE_MERCURYO_WIDGET_ID,
      type,
      fiat_currency: this.getValidCurrencyLabel(currency.label, supportedCurrencyLabels),
      lang: this.#lang,
      merchant_transaction_id: merchantTransactionId,
    })

    return `${this.#widgetUrl}/?${params.toString()}`
  }
}
