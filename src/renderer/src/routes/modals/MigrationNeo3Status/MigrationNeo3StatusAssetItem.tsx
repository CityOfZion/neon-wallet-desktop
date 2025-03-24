import { useTranslation } from 'react-i18next'
import { Token } from '@cityofzion/blockchain-service'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TProps = {
  amount: string
  token: Token
  blockchain: TBlockchainServiceKey
}

export const MigrationNeo3StatusAssetItem = ({ amount, token, blockchain }: TProps) => {
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { currency } = useCurrencySelector()
  const exchange = useExchange([{ blockchain, tokens: [token] }])

  const service = bsAggregator.blockchainServicesByName[blockchain]

  const fiatPrice = exchange.data
    ? ExchangeHelper.getExchangeConvertedPrice(token.hash, service.name, exchange.data)
    : 0

  const fiatAmount = NumberHelper.number(amount ?? 0) * fiatPrice

  return (
    <p className="flex items-center gap-x-2 uppercase w-full">
      <span className="text-white flex-grow">
        {amount} {token.symbol} <span className="text-gray-100">| {tBlockchain(blockchain)}</span>
      </span>

      <span className="font-bold text-right">{NumberHelper.currency(fiatAmount, currency.label)}</span>
    </p>
  )
}
