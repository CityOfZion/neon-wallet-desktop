import { useMemo, useState, useSyncExternalStore } from 'react'

import { BSError, isCalculableFee } from '@cityofzion/blockchain-service'
import { type ISwapOrchestrator, SwapOrchestrator, type TSwapToken } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useConfirmAction } from '@renderer/hooks/useConfirmAction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TAccount } from '@shared/types/store'

import { SwapAmountsCard } from './SwapAmountsCard'
import { SwapAssetsCard } from './SwapAssetsCard'
import { SwapExplanation } from './SwapExplanation'
import { SwapSourceCard } from './SwapSourceCard'

type TProps = {
  account?: TAccount
}

const createSwapOrchestrator = (): ISwapOrchestrator => new SwapOrchestrator(BlockchainServiceHelper.bsAggregator)

const isNonNativeStellarToken = (token: TSwapToken) => {
  const stellarService = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar

  return token.blockchain === 'stellar' && !!token.hash && !stellarService.tokenService.isNativeToken(token.hash)
}

export const SwapPageContent = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap' })
  const { modalNavigate } = useModalNavigate()
  const { confirmAction } = useConfirmAction()
  const { accounts } = useAccountsSelector()

  const [swapOrchestrator, setSwapOrchestrator] = useState(createSwapOrchestrator)

  const state = useSyncExternalStore(swapOrchestrator.store.subscribe, swapOrchestrator.store.getState)

  const serviceAccountToUse = state.accountToUse.value

  const accountToUse = useMemo(
    () => (serviceAccountToUse ? accounts.find(SharedAccountHelper.predicate(serviceAccountToUse)) : undefined),
    [accounts, serviceAccountToUse]
  )

  const balanceQuery = useBalance(accountToUse)

  const tokenToUse = state.tokenToUse.value
  const tokenToReceive = state.tokenToReceive.value

  const service = accountToUse
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[accountToUse.blockchain]
    : undefined

  const getErrorMessage = (error: BSError | null) => {
    if (!error) return

    return match(error.code)
      .with('AMOUNT_BELOW_ZERO', () => t('errors.amountZero'))
      .with('AMOUNT_BELOW_MINIMUM', () => t('errors.amountMin', { amount: error.metadata?.minAmount }))
      .with('AMOUNT_ABOVE_MAXIMUM', () => t('errors.amountMax', { amount: error.metadata?.maxAmount }))
      .with('AMOUNT_EXCEEDS_BALANCE', () => t('errors.insufficientFunds'))
      .with('FEE_EXCEEDS_BALANCE', 'FEE_CALCULATION_FAILED', () => t('errors.insufficientFundsFee'))
      .with('NO_QUOTES_AVAILABLE', () => t('errors.noQuotesAvailable'))
      .otherwise(() => error.message)
  }

  const isLoadingOrValidating = Object.values(state).some(
    field => ('loading' in field && field.loading) || ('validating' in field && field.validating)
  )

  const errorMessage = isLoadingOrValidating
    ? undefined
    : [
        state.accountToUse.error,
        state.availableTokensToReceive.error,
        state.amountToUse.error,
        state.quote.error,
        state.fee.error,
      ]
        .map(getErrorMessage)
        .find(Boolean)

  const isAbleToSwap = swapOrchestrator.isAbleToSwap()

  const handleRestart = () => {
    swapOrchestrator.cleanup()
    setSwapOrchestrator(createSwapOrchestrator())
  }

  const [isSwapping, handleSwap] = usePressOnce(async () => {
    if (!accountToUse || !isAbleToSwap) return

    try {
      await confirmAction({ account: accountToUse })

      const { swapId: orderId } = await swapOrchestrator.createOrder()

      // Not awaited, as executing can take a while (e.g. waiting for an approval to be confirmed) and the order can be tracked by its ID
      swapOrchestrator
        .executeOrder()
        .then(swapResult => {
          if (swapResult.status === 'failed') {
            LoggerHelper.sentry(new Error(swapResult.log), { where: 'SwapPageContent', operation: 'executeOrder' })
            ToastHelper.error({ message: AppError.wrap(new Error(swapResult.log)).displayMessage })
            return
          }
        })
        .catch(error => {
          LoggerHelper.sentry(error, { where: 'SwapPageContent', operation: 'executeOrder' })
          ToastHelper.error({ message: AppError.wrap(error).displayMessage })
        })

      modalNavigate('swap-details', { state: { orderId } })

      handleRestart()
    } catch (error) {
      LoggerHelper.sentry(error, { where: 'SwapPageContent', operation: 'submitSwap' })
      ToastHelper.error({ message: AppError.wrap(error).displayMessage })
    }
  })

  return (
    <section className="flex min-h-0 grow rounded-sm bg-gray-800">
      <SwapExplanation />

      <div className="flex min-h-0 grow flex-col items-center px-4 text-sm">
        <div className="flex w-full items-center justify-between gap-2 py-3">
          <h2 className="w-full text-sm text-white">{t('formTitle')}</h2>

          <Button
            label={t('restart')}
            variant="text-slim"
            colorSchema={isSwapping ? 'gray' : 'neon'}
            disabled={isSwapping}
            leftIcon={<MdRestartAlt aria-hidden />}
            onClick={handleRestart}
          />
        </div>

        <Separator />

        <div className="flex min-h-0 w-full grow flex-col items-center overflow-auto py-2">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 pt-2 pb-8">
            <SwapSourceCard
              swapOrchestrator={swapOrchestrator}
              accountToUse={accountToUse}
              initialAccount={account}
              disabled={isSwapping}
            />

            <ActionStepSeparator />

            <SwapAssetsCard
              swapOrchestrator={swapOrchestrator}
              state={state}
              balance={balanceQuery.data}
              isLoadingBalance={!!accountToUse && balanceQuery.isLoading}
              disabled={isSwapping}
            />

            <ActionStepSeparator />

            <SwapAmountsCard
              swapOrchestrator={swapOrchestrator}
              state={state}
              balance={balanceQuery.data}
              disabled={isSwapping}
            />

            {!!tokenToUse && isNonNativeStellarToken(tokenToUse) && (
              <Banner
                type="warning"
                className="mt-2.5 w-full"
                message={t('stellarTrustlineWarnings.source', { token: tokenToUse.symbol.toUpperCase() })}
              />
            )}

            {!!tokenToReceive && isNonNativeStellarToken(tokenToReceive) && (
              <Banner
                type="warning"
                className="mt-2.5 w-full"
                message={t('stellarTrustlineWarnings.receiver', { token: tokenToReceive.symbol.toUpperCase() })}
              />
            )}

            {errorMessage && <AlertErrorBanner className="mt-2.5 w-full" message={errorMessage} />}

            {(!service || isCalculableFee(service)) && (
              <TransactionFeeActionStep
                fee={state.fee.value || undefined}
                isCalculatingFee={state.fee.loading}
                service={service}
                className="mt-2.5"
              />
            )}

            <Button
              className="mt-8 w-full max-w-[20rem]"
              iconsOnEdge={false}
              onClick={handleSwap}
              label={t('submitLabel')}
              loading={isSwapping}
              leftIcon={<TbReplace aria-hidden />}
              disabled={isSwapping || !isAbleToSwap}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
