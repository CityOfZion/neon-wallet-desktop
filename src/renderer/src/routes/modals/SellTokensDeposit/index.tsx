import { ChangeEvent, useEffect, useMemo } from 'react'

import {
  BSBigNumberHelper,
  IBlockchainService,
  IBSWithFee,
  isCalculableFee,
  TBSToken,
  TIntentTransferParam,
} from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useConfirmAction } from '@renderer/hooks/useConfirmAction'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import type { TDepositActionsData } from '@renderer/routes/pages/BuyAndSellTokens'

import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import { thunks } from '@renderer/store/thunks'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TUseTransactionsTransfer } from '@shared/types/hooks'
import type { TModalState } from '@shared/types/modal'
import { IAccountState } from '@shared/types/store'

import { SellTokensDepositErrorContent } from './SellTokensDepositErrorContent'
import { SellTokensDepositSuccessContent } from './SellTokensDepositSuccessContent'

const SellTokensDepositModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit' })
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accounts } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()
  const { currency } = useCurrencySelector()
  const { account, depositActionsData, setDepositActionsData } = useModalState<TModalState<'sell-tokens-deposit'>>()
  const dispatch = useAppDispatch()
  const { confirmAction } = useConfirmAction()
  const debounceAddress = useDebounceFunction()
  const debounceAmount = useDebounceFunction()

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TDepositActionsData>(
    depositActionsData ?? {
      amount: '',
      isAmountLoading: false,
      address: '',
      account,
      isFeeLoading: false,
    }
  )

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance(actionData.account)

  const service = useMemo(
    () =>
      actionData?.account
        ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[actionData.account.blockchain]
        : undefined,
    [actionData.account]
  )

  const isServiceCalculableFee = service ? isCalculableFee(service) : false
  const isRecipientDisabled = !actionData.account

  const isInvalidForm =
    !service ||
    isBalanceLoading ||
    isRecipientDisabled ||
    !actionData.address ||
    !actionData.amount ||
    !actionData.token

  const isDisabled =
    !balanceData ||
    actionState.isActing ||
    !actionState.isValid ||
    actionData.isFeeLoading ||
    actionData.isAmountLoading ||
    Object.values(actionState.errors || {}).length > 0 ||
    isInvalidForm ||
    (isServiceCalculableFee && !actionData.fee)

  const getServiceTransferParams = () => {
    const { account, address, isAmountLoading } = actionData
    const token = actionData.token?.token
    const encryptedPassword = currentLoginSessionRef.current?.encryptedPassword

    if (!encryptedPassword || isInvalidForm || !account || isAmountLoading) return

    const intent: TIntentTransferParam = {
      amount: actionData.amount,
      receiverAddress: address,
      tokenHash: token!.hash,
      tokenDecimals: token!.decimals,
    }

    const key = window.api.sendSync('encryption:decryptBasedEncryptedSecretSync', {
      value: account.encryptedKey!,
      encryptedSecret: encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account, key })

    return {
      serviceAccount,
      intent,
    }
  }

  const handleOnClose = () => {
    setDepositActionsData({ ...actionData, fee: undefined, isFeeLoading: false, isAmountLoading: false })
  }

  const handleChangeAccount = (account: IAccountState) => {
    setData({
      account,
      ...(account.blockchain !== actionData.account?.blockchain ? { token: undefined, amount: '' } : {}),
    })
  }

  const handleChangeAmount = (value: string) => {
    setData({ amount: value, isAmountLoading: true })

    debounceAmount(() => {
      setData({
        amount: BSBigNumberHelper.format(value, { decimals: actionData.token?.token?.decimals }),
        isAmountLoading: false,
      })
    })
  }

  const handleChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    const address = StringHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })

    setData({ address })
  }

  const handleChangeToken = (token: TBSToken) => {
    if (!service) return

    const tokenBalance = balanceData?.tokensBalances?.find(tokenBalance =>
      service.tokenService.predicateByHash(token, tokenBalance.token)
    )

    setData({ token: tokenBalance, amount: '' })
  }

  const handleSubmit = async () => {
    if (isDisabled) return

    const transferParams = getServiceTransferParams()
    if (!transferParams) return

    const account = actionData.account!

    try {
      await confirmAction({ account })

      const { address, amount, token } = actionData
      const { serviceAccount, intent } = transferParams

      const [transactionHash] = await service.transfer({
        senderAccount: serviceAccount,
        intents: [intent],
      })

      const assetToken = token!.token

      const transaction: TUseTransactionsTransfer = {
        account,
        amount,
        asset: assetToken.symbol,
        assetHash: assetToken.hash,
        token: assetToken,
        to: address,
        from: account!.address,
        hash: transactionHash,
        time: DateHelper.getNowUnix(),
        fromAccount: account,
        toAccount: accounts.find(account => account.address === address),
        isPending: true,
      }

      dispatch(
        thunks.waitTransaction({
          transaction,
          successNotification: {
            title: 'modals:sellTokensDeposit.successNotification.title',
            previewBody: 'modals:sellTokensDeposit.successNotification.previewBody',
          },
          failureNotification: {
            title: 'modals:sellTokensDeposit.failureNotification.title',
            previewBody: 'modals:sellTokensDeposit.failureNotification.previewBody',
          },
        })
      )

      modalNavigate('success', {
        replace: true,
        state: {
          heading: t('title'),
          subtitle: t('success.subtitle'),
          headingIcon: <TbStepInto aria-hidden />,
          content: <SellTokensDepositSuccessContent transaction={transaction} />,
        },
      })
    } catch (error) {
      console.error(error)

      const appError = AppError.wrap(error, null)

      if (appError.fromAppError) {
        ToastHelper.error({ message: appError.displayMessage })
        return
      }

      modalNavigate('error', {
        replace: true,
        state: {
          heading: t('title'),
          subtitle: t('error.subtitle'),
          headingIcon: <TbStepInto aria-hidden />,
          content: <SellTokensDepositErrorContent errorMessage={appError.displayMessage} />,
        },
      })
    } finally {
      reset()
      setDepositActionsData(null)
    }
  }

  useEffect(() => {
    debounceAddress(() => {
      if (!actionData.address || !actionData.account || !service || service.validateAddress(actionData.address)) {
        clearErrors('address')

        return
      }

      setError('address', t('messages.invalidAddress'))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.address, actionData.account])

  useEffect(() => {
    if (isBalanceLoading) return

    const handleCalculateFee = async () => {
      try {
        if (!balanceData || !isServiceCalculableFee || actionData.isAmountLoading || isInvalidForm) {
          setData({ fee: undefined })

          return
        }

        const transferParams = getServiceTransferParams()

        if (!transferParams) {
          setData({ fee: undefined })

          return
        }

        setData({ isFeeLoading: true })

        const { intent } = transferParams

        const fee = await (service as IBlockchainService & IBSWithFee).calculateTransferFee({
          senderAccount: transferParams.serviceAccount,
          intents: [intent],
        })

        setData({ fee })

        const amountBn = BSBigNumberHelper.fromNumber(intent.amount || '0')
        let feeTotalBn = BSBigNumberHelper.fromNumber(fee)

        if (service.tokenService.predicateByHash(service.feeToken, intent.tokenHash)) {
          feeTotalBn = feeTotalBn.plus(amountBn)
        }

        const feeTokenAmount =
          balanceData?.tokensBalances?.find(({ token }) =>
            service.tokenService.predicateByHash(service.feeToken, token)
          )?.amount || '0'

        if (amountBn.isZero() || amountBn.isNegative()) {
          setError('amount', t('messages.invalidAmount'))
        } else if (
          amountBn.isGreaterThan(actionData?.token?.amount || '0') ||
          feeTotalBn.isGreaterThan(feeTokenAmount)
        ) {
          setError('amount', t('messages.insufficientFunds'))
        } else {
          clearErrors(['fee', 'amount'])
        }
      } catch (error) {
        console.error(error)

        const appError = AppError.wrap(error, t('messages.feeError'))
        ToastHelper.error({ message: appError.displayMessage })

        setError('fee', appError.displayMessage)
        setData({ fee: undefined })
      } finally {
        setData({ isFeeLoading: false })
      }
    }

    handleCalculateFee()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    actionData.account,
    actionData.amount,
    actionData.isAmountLoading,
    actionData.address,
    actionData.token,
    balanceData,
  ])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbStepInto aria-hidden />}
      contentClassName="flex flex-col overflow-y-auto"
      onErase={handleOnClose}
      size="lg"
    >
      <p className="mb-6 font-semibold">{t('description')}</p>

      <p className="mb-6">{t('observation')}</p>

      <Separator />

      <form className="mt-6 flex flex-col" onSubmit={handleAct(handleSubmit)}>
        <h3 className="mb-4 font-bold text-gray-300 uppercase">{t('form.title')}</h3>

        <ActionStep
          title={t('form.source.label')}
          className="rounded-sm bg-gray-700/60 px-4"
          titleClassName="font-semibold"
          leftIcon={<TbStepOut aria-hidden />}
        >
          <GreyAccountSelect
            selectedAccount={actionData.account}
            triggerClassName="text-xs"
            onSelect={handleChangeAccount}
          />
        </ActionStep>

        <ActionStepSeparator className="bg-gray-700/60" />

        <div className="relative mt-2 flex w-full flex-col gap-3">
          <div className="w-full rounded-sm bg-gray-800">
            <div className="flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-3.5">
              <ActionStep
                title={t('form.receive.label')}
                titleClassName="font-semibold"
                leftIcon={<TbStepInto aria-hidden />}
              />

              <Separator />

              <ActionStep
                title={t('form.token.label')}
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <GreyTokenSelect
                  selectedToken={actionData.token?.token}
                  tokens={balanceData?.tokensBalances?.map(tokenBalance => tokenBalance.token) ?? []}
                  balance={balanceData}
                  loading={isBalanceLoading}
                  disabled={isRecipientDisabled}
                  onSelect={handleChangeToken}
                />
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.address.label')}
                className="whitespace-nowrap"
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <Input
                  aria-label={t('form.address.label')}
                  placeholder={t('form.address.placeholder')}
                  className="w-full"
                  compacted
                  pastable
                  value={actionData.address ?? ''}
                  disabled={isRecipientDisabled}
                  errorMessage={actionState.errors.address}
                  onChange={handleChangeAddress}
                />
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.amount.label')}
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
                footer={
                  <div className="flex w-full justify-between text-xs text-gray-100 italic">
                    <p>{t('labels.fiat', { currencyLabel: currency.label })}</p>

                    <p>
                      {CurrencyHelper.format(
                        actionData.amount && actionData.token
                          ? NumberHelper.number(actionData.amount) * actionData.token.exchangeConvertedPrice
                          : 0,
                        { currency, maximumFractionDigits: 6 }
                      )}
                    </p>
                  </div>
                }
              >
                <GreyAmountInput
                  value={actionData.amount}
                  disabled={isRecipientDisabled || !actionData.token}
                  onChangeValue={handleChangeAmount}
                />
              </ActionStep>
            </div>
          </div>
        </div>

        {(!service || isServiceCalculableFee) && (
          <TransactionFeeActionStep
            title={t('labels.fee')}
            className="font-normal"
            titleClassName="text-sm font-semibold"
            fiatClassName="text-gray-300"
            fee={actionData.fee ?? '0'}
            isCalculatingFee={actionData.isFeeLoading}
            service={service}
          />
        )}

        {(actionState.errors.fee || actionState.errors.amount || actionState.errors.account) && (
          <AlertErrorBanner
            className="mt-2 w-full"
            message={actionState.errors.fee || actionState.errors.amount || actionState.errors.account || ''}
          />
        )}

        <Button
          label={t('buttons.submit')}
          className="mx-auto mt-12 w-full max-w-[18rem]"
          iconsOnEdge={false}
          flat
          type="submit"
          loading={actionState.isActing}
          disabled={isDisabled}
          leftIcon={<TbStepOut aria-hidden />}
        />
      </form>
    </SideModalLayout>
  )
}

export default SellTokensDepositModal
