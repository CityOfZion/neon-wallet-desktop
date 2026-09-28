import { SharedConstantsHelper } from '@shared/helpers/SharedConstantsHelper'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import type { TBuyAndSellTokensHelperBuildUrlParams } from '@shared/types/helpers'
import type { TAvailableCurrency } from '@shared/types/store'

export class BuyAndSellTokensHelper {
  static readonly sumsubTermsAndConditionsUrl = 'https://sumsub.com/terms-and-conditions'
  static readonly mercuryoTermsUrl = 'https://mercuryo.io/legal/terms'
  static readonly #defaultCurrencyLabel: TAvailableCurrency = 'USD'
  static readonly #supportedBuyCurrencyLabels: TAvailableCurrency[] = [this.#defaultCurrencyLabel, 'EUR', 'BRL', 'GBP']
  static readonly #supportedSellCurrencyLabels: TAvailableCurrency[] = [this.#defaultCurrencyLabel, 'EUR', 'GBP']
  static readonly #lang = 'en'
  static readonly #theme = 'exolix'
  static readonly #defaultToken = 'BTC'

  static getValidCurrencyLabel(
    currencyLabel: TAvailableCurrency,
    supportedCurrencyLabels: TAvailableCurrency[]
  ): TAvailableCurrency {
    return supportedCurrencyLabels.includes(currencyLabel) ? currencyLabel : this.#defaultCurrencyLabel
  }

  static buildUrl({
    address,
    currency,
    merchantTransactionId,
    type,
    refundAddress,
  }: TBuyAndSellTokensHelperBuildUrlParams) {
    if (!SharedEnvHelper.VITE_MERCURYO_WIDGET_ID) return

    // The wallet address is not sent because Mercuryo requires it to be signed with the widget secret, which can't
    // be safely stored in the app. The user pastes the destination address in the widget instead.
    const params = new URLSearchParams({
      widget_id: SharedEnvHelper.VITE_MERCURYO_WIDGET_ID,
      type,
      currency: this.#defaultToken,
      fiat_currency: this.getValidCurrencyLabel(
        currency.label,
        type === 'buy' ? this.#supportedBuyCurrencyLabels : this.#supportedSellCurrencyLabels
      ),
      lang: this.#lang,
      theme: this.#theme,
      merchant_transaction_id: merchantTransactionId,
    })

    if (address) {
      params.set('address', address)
    }

    if (refundAddress) {
      params.set('refund_address', refundAddress)
    }

    return `${SharedConstantsHelper.BUY_AND_SELL_URL}/?${params.toString()}`
  }
}
