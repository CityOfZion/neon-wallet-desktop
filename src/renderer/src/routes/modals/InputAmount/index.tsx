import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TTokenBalance } from '@shared/@types/query'

import { FiatAmountInput } from './FiatAmountInput'
import { TokenAmountInput } from './TokenAmountInput'

type TState = {
  tokenBalance: TTokenBalance
  onSelectAmount: (amount: string) => void
}

type TActionData = {
  amount: string
  fiatAmount: string
  tokenAmount: string
}

export const InputAmount = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'inputAmount' })
  const { modalNavigate } = useModalNavigate()
  const { tokenBalance, onSelectAmount } = useModalState<TState>()

  const { actionData, actionState, handleAct, setData, setError } = useActions<TActionData>({
    amount: '',
    fiatAmount: '',
    tokenAmount: '',
  })

  const balanceRest = (tokenBalance.amountNumber - NumberHelper.number(actionData.amount)).toFixed(
    tokenBalance.token.decimals
  )

  const handleTokenAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = NumberHelper.formatString(event.target.value, tokenBalance.token.decimals)

    const valueNumber = NumberHelper.number(value)

    setData({
      amount: value,
      tokenAmount: value,
      fiatAmount: '',
    })

    if (valueNumber <= 0 || tokenBalance.amountNumber < valueNumber) {
      setError('tokenAmount', t('insufficientBalanceAvailable'))
    }
  }

  const handleFiatAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    const valueNumber = NumberHelper.number(value)

    const tokenAmount = (valueNumber / tokenBalance.exchangeConvertedPrice).toFixed(tokenBalance.token.decimals)
    const tokenAmountNumber = NumberHelper.number(tokenAmount)

    setData({
      amount: tokenAmount,
      tokenAmount: '',
      fiatAmount: value,
    })

    if (tokenBalance.amountNumber < tokenAmountNumber) {
      setError('fiatAmount', t('insufficientBalanceAvailable'))
    }
  }

  const handleSubmit = (data: TActionData) => {
    onSelectAmount(data.amount)
    modalNavigate(-1)
  }

  const handleMaxClick = () => {
    setData({
      amount: tokenBalance.amount,
      tokenAmount: tokenBalance.amount,
      fiatAmount: '',
    })
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbStepOut />}>
      <form
        className="w-full flex flex-col h-full items-center text-sm flex-grow min-w-0"
        onSubmit={handleAct(handleSubmit)}
      >
        <div className="flex w-full items-center justify-between bg-gray-900/50 rounded-full px-3 py-1.5">
          <div className="flex gap-2.5 items-center">
            <div className="rounded-full bg-gray-300 w-6 h-6 p-1.5 flex justify-center items-center">
              <BlockchainIcon blockchain={tokenBalance.blockchain} type="white" className="w-full h-full" />
            </div>

            <span className="uppercase" title={tokenBalance.token.symbol}>
              {StringHelper.truncateString(tokenBalance.token.symbol, 4)}
            </span>
          </div>

          <span className="text-gray-100">{tokenBalance.amount}</span>
        </div>

        <TokenAmountInput
          onChange={handleTokenAmountChange}
          value={actionData.tokenAmount}
          onMaxClick={handleMaxClick}
          exchangeConvertedPrice={tokenBalance.exchangeConvertedPrice}
          error={!!actionState.errors.tokenAmount}
        />

        <div
          className={StyleHelper.mergeStyles('w-full relative my-6 flex justify-center', {
            'opacity-25': tokenBalance.exchangeConvertedPrice === 0 || tokenBalance.token.decimals === 0,
          })}
        >
          <Separator className="absolute top-1/2" />

          <span className="rounded-full relative text-xs p-1.5 border-[0.5rem] border-gray-800 bg-white text-gray-800 font-bold">
            {t('or')}
          </span>
        </div>

        <FiatAmountInput
          onChange={handleFiatAmountChange}
          value={actionData.fiatAmount}
          exchangeConvertedPrice={tokenBalance.exchangeConvertedPrice}
          tokenBalance={tokenBalance}
          error={!!actionState.errors.fiatAmount}
        />

        <Separator className="my-9" />

        <div className="flex justify-between text-xs italic min-w-0 gap-4 w-full">
          <span className="block text-gray-300 whitespace-nowrap">{t('balanceAfterTransaction')}</span>

          <div className="text-gray-100 flex gap-0.5 min-w-0">
            <span className="block truncate">{balanceRest}</span>
            <span className="block">{StringHelper.truncateString(tokenBalance.token.symbol, 4)}</span>
          </div>
        </div>

        {(actionState.errors.tokenAmount || actionState.errors.fiatAmount) && (
          <AlertErrorBanner
            message={actionState.errors.tokenAmount! || actionState.errors.fiatAmount!}
            className="w-full mt-3.5"
          />
        )}

        <Button
          className="w-full px-5 mt-auto"
          type="submit"
          label={t('selectAmountSend')}
          disabled={!actionState.isValid}
        />
      </form>
    </SideModalLayout>
  )
}
