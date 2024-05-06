import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { TokenBalance } from '@renderer/@types/query'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { BalanceHelper } from '@renderer/helpers/BalanceHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

type TAmountParams = {
  selectedAccount?: IAccountState
  selectedToken?: TokenBalance
  selectedAmount?: string
  onSelectAmount?: (amount: string) => void
  active: boolean
}

export const SendAmount = ({
  selectedAccount,
  selectedToken,
  selectedAmount,
  onSelectAmount,
  active,
}: TAmountParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { currency } = useCurrencySelector()
  const balanceExchange = useBalancesAndExchange(selectedAccount ? [selectedAccount] : [])

  const estimatedFee = useMemo(() => {
    if (!selectedToken || !selectedAmount) return NumberHelper.currency(0, currency.label)

    const pricePerToken = BalanceHelper.getExchangeRatio(
      selectedToken.token.hash,
      selectedToken.blockchain,
      balanceExchange.exchange.data
    )

    return NumberHelper.currency(NumberHelper.number(selectedAmount) * pricePerToken, currency.label)
  }, [selectedToken, selectedAmount, currency.label, balanceExchange.exchange.data])

  return (
    <div>
      <div className="flex justify-between my-1">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center">
            <VscCircleFilled className="text-gray-300 w-2 h-2" />
          </div>

          <span
            className={StyleHelper.mergeStyles({
              'font-bold': active,
            })}
          >
            {t('amount')}
          </span>
        </div>
        <Button
          className="flex items-center"
          disabled={!selectedToken}
          onClick={modalNavigateWrapper('input-amount', {
            state: {
              balanceExchange: balanceExchange,
              tokenBalance: selectedToken,
              onSelectAmount: onSelectAmount,
            },
          })}
          clickableProps={{
            className: 'text-sm pl-3 pr-1',
          }}
          variant="text"
          colorSchema={active ? 'neon' : 'white'}
          label={selectedAmount?.toString() ?? t('inputAmount')}
          rightIcon={<TbChevronRight />}
          flat
        />
      </div>

      <div className="flex justify-between p-3 pt-0">
        <span className="text-gray-100 ml-5 italic">{t('fiatValue', { currencyType: currency.label })}</span>
        <span className="text-gray-100 mr-5">{estimatedFee}</span>
      </div>
    </div>
  )
}
