import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { isCalculableFee } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance } from '@shared/@types/query'

import { TSendServiceResponse } from './SendPageContent'

type TProps = {
  selectedToken?: TTokenBalance
  getSendFields(): Promise<TSendServiceResponse>
  onFeeChange(fee?: string): void
  fee?: string
}

export const TotalFee = ({ getSendFields, onFeeChange, fee, selectedToken }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })

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
          intents: [
            {
              amount: fields.selectedAmount,
              receiverAddress: fields.serviceAccount.address,
              tokenHash: fields.selectedToken.token.hash,
              tokenDecimals: fields.selectedToken.token.decimals,
            },
          ],
          senderAccount: fields.serviceAccount,
          isLedger: fields.selectedAccount.type === 'hardware',
        })

        onFeeChange(`${fee} ${fields.service.feeToken.symbol}`)

        setFiatFee(NumberHelper.number(fee) * (selectedToken?.exchangeConvertedPrice ?? 0))
      } catch (error) {
        console.error(error)

        ToastHelper.error({ message: t('error.feeError') })
      } finally {
        setLoading(false)
      }
    }

    handle()
  }, [onFeeChange, getSendFields, selectedToken, t])

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
