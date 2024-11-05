import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { BlockchainService } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { ActionStep } from './ActionStep'

type TProps = {
  fee?: string
  isCalculatingFee: boolean
  service?: BlockchainService<TBlockchainServiceKey>
}

export const TransactionFeeActionStep = ({ fee, isCalculatingFee, service }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionFeeActionStep' })
  const { currency } = useCurrencySelector()

  const exchange = useExchange(service ? [{ blockchain: service.name, tokens: [service.feeToken] }] : [])

  const feeTokenConvertedPrice =
    exchange && service
      ? ExchangeHelper.getExchangeConvertedPrice(service.feeToken.hash, service.name, exchange.data)
      : 0

  const fiatFee = NumberHelper.number(fee ?? 0) * feeTokenConvertedPrice

  return (
    <ActionStep title={t('title')} leftIcon={<TbReceipt />} className="bg-gray-700/60 rounded px-4 mt-2 min-h-11">
      {isCalculatingFee ? (
        <Loader className="w-4 h-4" containerClassName="w-min items-center" />
      ) : (
        <div className="flex items-center gap-4.5">
          <span className="text-gray-100">
            {fee} {service?.feeToken.symbol}
          </span>
          <span className="text-gray-300">{NumberHelper.currency(fiatFee, currency.label)}</span>
        </div>
      )}
    </ActionStep>
  )
}
