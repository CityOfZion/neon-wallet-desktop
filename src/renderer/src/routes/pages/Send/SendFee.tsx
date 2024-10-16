import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { BlockchainService } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TProps = {
  fee?: string
  isCalculatingFee: boolean
  service?: BlockchainService<TBlockchainServiceKey>
}

export const SendFee = ({ fee, isCalculatingFee, service }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.fee' })
  const { currency } = useCurrencySelector()

  const exchange = useExchange(service ? [{ blockchain: service.blockchainName, tokens: [service.feeToken] }] : [])

  const feeTokenConvertedPrice =
    exchange && service
      ? ExchangeHelper.getExchangeConvertedPrice(service.feeToken.hash, service.blockchainName, exchange.data)
      : 0

  const fiatFee = NumberHelper.number(fee ?? 0) * feeTokenConvertedPrice

  return (
    <div className="flex justify-between bg-gray-700/60 py-2.5 rounded px-3 w-full mt-2">
      <div className="flex items-center gap-3">
        <TbReceipt className="text-blue w-5 h-5" />
        <span>{t('title')}</span>
      </div>

      {isCalculatingFee ? (
        <Loader className="w-4 h-4" containerClassName="w-min items-center" />
      ) : (
        <div className="flex items-center gap-4.5">
          <span className="text-gray-100">{fee}</span>
          <span className="text-gray-300">{NumberHelper.currency(fiatFee ?? 0, currency.label)}</span>
        </div>
      )}
    </div>
  )
}
