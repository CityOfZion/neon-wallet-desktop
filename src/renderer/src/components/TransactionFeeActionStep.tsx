import { IBlockchainService } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Loader } from '@renderer/components/Loader'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { ActionStep } from './ActionStep'

type TProps = {
  fee?: string
  isCalculatingFee?: boolean
  service?: IBlockchainService<TBlockchainServiceKey>
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
      leftIcon={<TbReceipt aria-hidden className="h-6 min-h-6 w-6 min-w-6" />}
      className={StyleHelper.mergeStyles('mt-2 min-h-11 rounded-sm bg-gray-700/60 px-4 font-bold', className)}
      titleClassName={StyleHelper.mergeStyles('whitespace-nowrap mr-3 overflow-visible!', titleClassName)}
      headerClassName="gap-4"
      defaultHeight="auto"
    >
      {isCalculatingFee ? (
        <Loader className="h-4 w-4" containerClassName="w-min items-center" />
      ) : (
        <div className={StyleHelper.mergeStyles('flex items-center gap-3 text-sm', textClassName)}>
          <span className="mt-0.5 text-right leading-4 font-normal uppercase">
            {(!service ? '' : fee) ?? '0.00'} {service?.feeToken.symbol}{' '}
            {service ? <span className="text-gray-100">| {service.name}</span> : null}
          </span>

          <span className={StyleHelper.mergeStyles('whitespace-nowrap text-white', fiatClassName)}>
            {CurrencyHelper.format(fiatFee, { currency })}
          </span>
        </div>
      )}
    </ActionStep>
  )
}
