import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { isCalculableFee } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { TSendServiceResponse } from '.'

type TTotalFeeParams = {
  getSendFields(): Promise<TSendServiceResponse>
  onFeeChange(fee?: string): void
  fee?: string
}

export const TotalFee = ({ getSendFields, onFeeChange, fee }: TTotalFeeParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const exchange = useExchange()
  const { currency } = useCurrencySelector()

  const [fiatFee, setFiatFee] = useState<number>()
  const [loading, setLoading] = useState(false)

  useLayoutEffect(() => {
    const handle = async () => {
      try {
        onFeeChange(undefined)
        setFiatFee(undefined)
        const fields = await getSendFields()

        if (!fields || !isCalculableFee(fields.service)) return
        setLoading(true)

        const fee = await fields.service.calculateTransferFee({
          intent: {
            amount: fields.selectedAmount,
            receiverAddress: fields.serviceAccount.address,
            tokenHash: fields.selectedToken.token.hash,
            tokenDecimals: fields.selectedToken.token.decimals,
          },
          senderAccount: fields.serviceAccount,
        })

        onFeeChange(`${fee} ${fields.service.feeToken.symbol}`)

        const exchangeRatio = BalanceHelper.getExchangeRatio(
          fields.selectedToken.token.hash,
          fields.selectedToken.blockchain,
          exchange.data
        )

        setFiatFee(NumberHelper.number(fee) * exchangeRatio)
      } finally {
        setLoading(false)
      }
    }

    handle()
  }, [getSendFields, exchange.data, onFeeChange])

  return (
    <div className="flex justify-between bg-gray-700/60 py-2.5 rounded px-3 w-full mt-2">
      <div className="flex items-center gap-3">
        <TbReceipt className="text-blue w-5 h-5" />
        <span>{t('totalFee')}</span>
      </div>

      {loading ? (
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
