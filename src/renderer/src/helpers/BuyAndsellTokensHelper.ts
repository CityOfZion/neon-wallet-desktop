import { hideBrand, lang, merchantId, theme } from '@renderer/constants/buy-and-sell-tokens'
import { IAccountState, TAvailableCurrency, TCurrency } from '@shared/@types/store'

type TGetMountedUrlParams = {
  domainUrl: string
  currency: TCurrency
  account?: IAccountState
}

export class BuyAndsellTokensHelper {
  static getValidCurrencyLabel(currencyLabel: TAvailableCurrency) {
    return ['USD', 'EUR', 'BRL', 'GBP'].includes(currencyLabel) ? currencyLabel : 'USD'
  }

  static getMountedUrl({ domainUrl, currency, account }: TGetMountedUrlParams) {
    return `${domainUrl}?merchantId=${merchantId}&fiatCurrency=${BuyAndsellTokensHelper.getValidCurrencyLabel(currency.label)}&lang=${lang}&themeMode=${theme}&hideBrand=${hideBrand}&wallet=${account?.address ?? ''}`
  }
}
