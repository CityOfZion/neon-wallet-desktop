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
  title?: string
  titleClassName?: string
  textClassName?: string
  fiatClassName?: string
}

export const TransactionFeeActionStep = ({
  fee,
  isCalculatingFee,
  service,
  className,
  title,
  titleClassName,
  textClassName,
  fiatClassName,
}: TProps) => {
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
      title={title ?? t('title')}
      leftIcon={<TbReceipt aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
      className={StyleHelper.mergeStyles('bg-gray-700/60 font-bold rounded px-4 mt-2 min-h-11', className)}
      titleClassName={StyleHelper.mergeStyles('text-md whitespace-nowrap mr-3 !overflow-visible', titleClassName)}
      headerClassName="gap-4"
    >
      {isCalculatingFee ? (
        <Loader className="w-4 h-4" containerClassName="w-min items-center" />
      ) : (
        <div className={StyleHelper.mergeStyles('flex items-center gap-3 text-sm', textClassName)}>
          <span className="font-normal uppercase mt-0.5 text-right leading-4">
            {(!service ? '' : fee) ?? '0.00'} {service?.feeToken.symbol}{' '}
            {service ? <span className="text-gray-100">| {service.name}</span> : null}
          </span>

          <span className={StyleHelper.mergeStyles('text-white whitespace-nowrap', fiatClassName)}>
            {NumberHelper.currency(fiatFee, currency.label)}
          </span>
        </div>
      )}
    </ActionStep>
  )
}
