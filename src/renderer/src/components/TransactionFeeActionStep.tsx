import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { BlockchainService } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { ActionStep } from './ActionStep'

type TProps = {
  fee?: string
  isCalculatingFee: boolean
  service?: BlockchainService<TBlockchainServiceKey>
  className?: string
}

export const TransactionFeeActionStep = ({ fee, isCalculatingFee, service, className }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionFeeActionStep' })
  const { currency } = useCurrencySelector()

  const exchange = useExchange(service ? [{ blockchain: service.name, tokens: [service.feeToken] }] : [])

  const feeTokenConvertedPrice =
    exchange && service
      ? ExchangeHelper.getExchangeConvertedPrice(service.feeToken.hash, service.name, exchange.data)
      : 0

  const fiatFee = NumberHelper.number(fee ?? 0) * feeTokenConvertedPrice

  return (
    <ActionStep
      title={t('title')}
      leftIcon={<TbReceipt aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
      className={StyleHelper.mergeStyles('bg-gray-700/60 font-bold rounded px-4 mt-2 min-h-11', className)}
      titleClassName="text-md"
      headerClassName="gap-4"
    >
      {isCalculatingFee ? (
        <Loader className="w-4 h-4" containerClassName="w-min items-center" />
      ) : (
        <div className="flex items-center gap-4.5 text-sm">
          <span className="font-normal uppercase mt-0.5">
            {fee ?? '0.00'} {service?.feeToken.symbol}{' '}
            {service ? <span className="text-gray-100">| {service.name}</span> : null}
          </span>

          <span className="text-white">{NumberHelper.currency(fiatFee, currency.label)}</span>
        </div>
      )}
    </ActionStep>
  )
}
