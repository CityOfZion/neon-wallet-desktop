import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbReceipt } from 'react-icons/tb'
import { isCalculableFee, Token } from '@cityofzion/blockchain-service'
import { Loader } from '@renderer/components/Loader'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { IAccountState } from '@shared/@types/store'

import { TSendServiceResponse } from './SendPageContent'

type TProps = {
  feeToken: Token
  selectedAccount?: IAccountState
  getSendFields(): Promise<TSendServiceResponse>
  onFeeChange(fee?: string): void
  fee?: string
}

export const TotalFee = ({ getSendFields, onFeeChange, fee, selectedAccount, feeToken }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { currency } = useCurrencySelector()
  const [loading, setLoading] = useState(false)

  const exchange = useExchange(
    selectedAccount?.blockchain ? [{ blockchain: selectedAccount.blockchain, tokens: [feeToken] }] : []
  )

  const feeTokenConvertedPrice =
    exchange && selectedAccount?.blockchain
      ? ExchangeHelper.getExchangeConvertedPrice(feeToken.hash, selectedAccount.blockchain, exchange.data)
      : 0
  const fiatFee = NumberHelper.number(fee ?? 0) * feeTokenConvertedPrice

  useLayoutEffect(() => {
    const handle = async () => {
      try {
        onFeeChange(undefined)

        const fields = await getSendFields()

        if (!fields || !isCalculableFee(fields.service)) return
        setLoading(true)
        const fee = await fields.service.calculateTransferFee({
          intents: fields.intents,
          senderAccount: fields.serviceAccount,
          isLedger: fields.selectedAccount.type === 'hardware',
        })
        onFeeChange(`${fee} ${fields.service.feeToken.symbol}`)
      } catch {
        ToastHelper.error({ message: t('error.feeError') })
      } finally {
        setLoading(false)
      }
    }

    handle()
  }, [onFeeChange, getSendFields, t])

  return (
    <div className="flex justify-between bg-gray-700/60 py-2.5 rounded px-3 w-full mt-2">
      <div className="flex items-center gap-3">
        <TbReceipt className="text-blue w-5 h-5" />
        <span>{t('totalFee')}</span>
      </div>

      {loading && exchange?.isLoading ? (
        <Loader className="w-4 h-4" containerClassName="w-min items-center" />
      ) : (
        <div className="flex items-center gap-4.5">
          <span className="text-gray-100">{fee}</span>
          <span className="text-gray-300">{NumberHelper.currency(fiatFee, currency.label)}</span>
        </div>
      )}
    </div>
  )
}
