import type { ISwapOrchestrator, TSwapOrchestratorState } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { useIsFocused } from '@renderer/hooks/useIsFocused'

import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbWand from '@renderer/assets/images/tb-wand.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import type { TBalance } from '@shared/types/query'

type TProps = {
  swapOrchestrator: ISwapOrchestrator
  state: TSwapOrchestratorState
  balance?: TBalance
  disabled: boolean
}

export const SwapAmountsCard = ({ swapOrchestrator, state, balance, disabled }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap.amountsCard' })
  const { ref: amountInputRef, isFocused: isAmountInputFocused } = useIsFocused<HTMLInputElement>()

  const tokenToUseBalance = balance?.tokensBalances.find(({ token }) => token.hash === state.tokenToUse.value?.hash)

  const isDisabled = disabled || !state.tokenToReceive.value || state.addressToReceive.valid !== true

  const handleChangeAmountToUse = (value: string) => {
    swapOrchestrator.setAmountToUse(value || null)
  }

  return (
    <div className="mt-2.5 flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4">
      <ActionStep
        title={t('amounts')}
        className="font-bold"
        leftIcon={<TbCoin aria-hidden className="min-size-6 max-size-6 size-6" />}
      />

      <Separator />

      <ActionStep
        title={t('amountToUseTitle')}
        leftIcon={<VscCircleFilled aria-hidden className="min-size-2 max-size-2 size-2 text-gray-300" />}
      >
        <Tooltip
          title={t('tooltipTitle')}
          variant="black"
          open={isAmountInputFocused}
          contentProps={{ side: 'top' }}
          icon={<TbWand aria-hidden className="text-blue min-size-6 max-size-6 size-6" />}
        >
          <GreyAmountInput
            ref={amountInputRef}
            value={state.amountToUse.value || ''}
            onChangeValue={handleChangeAmountToUse}
            disabled={isDisabled}
            loading={state.amountToUse.formatting || state.amountToUse.validating}
          />
        </Tooltip>
      </ActionStep>

      <div className="flex w-full justify-between pb-4 pl-9 text-xs text-gray-200 italic">
        <span>{t('balanceLabel')}</span>
        <span className="text-gray-100">{tokenToUseBalance?.amount || t('balancePlaceholder')}</span>
      </div>

      <Separator />

      <ActionStep
        title={
          <p className="text-sm text-white">
            {t('amountToReceiveTitle')}
            <span className="text-gray-100">{` ${t('amountToReceiveTitleComplement')}`}</span>
          </p>
        }
        leftIcon={<VscCircleFilled aria-hidden className="min-size-2 max-size-2 size-2 text-gray-300" />}
      >
        <GreyAmountInput
          disabled={isDisabled}
          readOnly
          className="bg-transparent"
          value={state.quote.value?.amountToReceive || ''}
          loading={state.quote.loading}
        />
      </ActionStep>
    </div>
  )
}
