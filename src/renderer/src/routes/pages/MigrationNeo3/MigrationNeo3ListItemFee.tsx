import { TBSToken } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'

import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

type TProps = {
  fee: string
  hasAmount: boolean
  neo3Token: TBSToken
}

export const MigrationNeo3ListItemFee = ({ fee, hasAmount, neo3Token }: TProps) => {
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { currency } = useCurrencySelector()
  const { data: exchangeData } = useExchange(hasAmount ? [{ blockchain: 'neo3', tokens: [neo3Token] }] : [])

  const fiatPrice = exchangeData ? ExchangeHelper.getExchangeConvertedPrice(neo3Token.hash, 'neo3', exchangeData) : 0
  const fiatFee = NumberHelper.number(fee ?? '0') * fiatPrice

  if (!fee) return null

  return (
    <li className="text-right text-white uppercase">
      {fee} {neo3Token.symbol} <span className="text-gray-100">| {tBlockchain('neo3')}</span>{' '}
      <span className="ml-2 font-semibold text-white">{NumberHelper.currency(fiatFee, currency.label)}</span>
    </li>
  )
}
