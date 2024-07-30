import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { Button } from '@renderer/components/Button'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

type TAmountParams = {
  selectedAccount?: IAccountState
  selectedToken?: TTokenBalance
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
  const balanceExchange = useBalances(selectedAccount ? [selectedAccount] : [])

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
        <span className="text-gray-100 mr-5">
          {NumberHelper.currency(
            selectedAmount && selectedToken
              ? NumberHelper.number(selectedAmount) * selectedToken.exchangeConvertedPrice
              : 0,
            currency.label
          )}
        </span>
      </div>
    </div>
  )
}
