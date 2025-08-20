import { ChangeEvent, Dispatch, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BlockchainService,
  BSBigNumberHelper,
  BSCalculableFee,
  BSTokenHelper,
  IntentTransferParam,
  isCalculableFee,
  Token,
} from '@cityofzion/blockchain-service'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'
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
import { DateHelper } from '@renderer/helpers/DateHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TDepositActionsData } from '@renderer/routes/pages/BuyAndSellTokens'
import { thunks } from '@renderer/store/thunks'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'

import { SellTokensDepositErrorContent } from './SellTokensDepositErrorContent'
import { SellTokensDepositSuccessContent } from './SellTokensDepositSuccessContent'

type TLocationState = {
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  account?: IAccountState
}

export const SellTokensDepositModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit' })
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accounts } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()
  const { currency } = useCurrencySelector()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const { account, depositActionsData, setDepositActionsData } = useModalState<TLocationState>()
  const dispatch = useAppDispatch()
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
    () => (actionData?.account ? bsAggregator.blockchainServicesByName[actionData.account.blockchain] : undefined),
    [actionData.account]
  )

  const isServiceCalculableFee = service ? isCalculableFee(service) : false
  const isRecipientDisabled = !actionData.account
  const isInvalidForm =
    isRecipientDisabled ||
    !actionData.address ||
    !actionData.amount ||
    !actionData.token ||
    !service ||
    !!actionState.errors.address

  const getServiceTransferParams = () => {
    const { account, address, isAmountLoading } = actionData
    const token = actionData.token?.token
    const encryptedPassword = currentLoginSessionRef.current?.encryptedPassword

    if (!encryptedPassword || isInvalidForm || !account || isAmountLoading) return

    const intent: IntentTransferParam = {
      amount: actionData.amount,
      receiverAddress: address,
      tokenHash: token!.hash,
      tokenDecimals: token!.decimals,
    }

    const key = window.api.sendSync('decryptBasedEncryptedSecretSync', {
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
    setDepositActionsData({ ...actionData, fee: undefined, isFeeLoading: false })
  }

  const handleChangeAccount = (account: IAccountState) => {
    setData({
      account,
      ...(account.blockchain !== actionData.account?.blockchain ? { token: undefined, amount: '' } : {}),
    })
  }

  const handleChangeAmount = (value: string) => {
    try {
      setData({
        amount: value,
        isAmountLoading: true,
      })

      debounceAmount(() => {
        setData({
          amount: BSBigNumberHelper.format(value, {
            decimals: actionData.token?.token?.decimals,
          }),
          isAmountLoading: false,
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    const address = UtilsHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })

    setData({ address })
  }

  const handleChangeToken = (token: Token) => {
    const tokenHash = BSTokenHelper.normalizeHash(token.hash)
    const tokenBalance = balanceData?.tokensBalances.find(
      tokenBalance => BSTokenHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
    )

    setData({ token: tokenBalance, amount: '' })
  }

  const handleSubmit = async () => {
    const transferParams = getServiceTransferParams()
    const { address, amount, token, account } = actionData

    if (!transferParams || actionData.isFeeLoading || isInvalidForm) return

    if (account?.type === 'hardware') {
      const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(account)

      if (!isConnectedAndUnlocked) {
        ToastHelper.error({ message: t('messages.hardwareWalletShouldBeValidError'), duration: 8000 })

        return
      }
    }

    try {
      const { serviceAccount, intent } = transferParams
      const [transactionHash] = await service.transfer({
        senderAccount: serviceAccount,
        intents: [intent],
      })

      const assetToken = token!.token

      const transaction: TUseTransactionsTransfer = {
        account: account!,
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
          headingIcon: <TbStepInto aria-hidden={true} />,
          content: <SellTokensDepositSuccessContent transaction={transaction} />,
        },
      })
    } catch (error: any) {
      console.error(error)

      modalNavigate('error', {
        replace: true,
        state: {
          heading: t('title'),
          subtitle: t('error.subtitle'),
          headingIcon: <TbStepInto aria-hidden={true} />,
          content: <SellTokensDepositErrorContent errorMessage={error?.message ?? ''} />,
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
        const transferParams = getServiceTransferParams()
        if (!transferParams || !isServiceCalculableFee || isInvalidForm) {
          setData({ fee: undefined })
          return
        }

        setData({ isFeeLoading: true })

        const { intent } = transferParams
        const feeTokenHash = BSTokenHelper.normalizeHash(service.feeToken.hash)

        const fee = await (service as BlockchainService & BSCalculableFee).calculateTransferFee({
          senderAccount: transferParams.serviceAccount,
          intents: [intent],
        })

        setData({ fee })

        let totalFee = NumberHelper.number(fee)

        if (BSTokenHelper.normalizeHash(intent.tokenHash) === feeTokenHash)
          totalFee += NumberHelper.number(intent.amount)

        const feeBalance =
          balanceData?.tokensBalances?.find(({ token }) => BSTokenHelper.normalizeHash(token.hash) === feeTokenHash)
            ?.amountNumber ?? 0

        totalFee > feeBalance ? setError('fee', t('messages.insufficientFunds')) : clearErrors('fee')
      } catch (error) {
        console.error(error)

        const errorMessage = t('messages.feeError')

        ToastHelper.error({ message: errorMessage })

        setError('fee', errorMessage)
        setData({ fee: undefined })

        throw error
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
      headingIcon={<TbStepInto aria-hidden={true} />}
      contentClassName="flex flex-col overflow-y-auto"
      onClose={handleOnClose}
    >
      <p className="mb-6 font-semibold">{t('description')}</p>

      <p className="mb-6">{t('observation')}</p>

      <Separator />

      <form className="mt-6 flex flex-col" onSubmit={handleAct(handleSubmit)}>
        <h3 className="mb-4 font-bold uppercase text-gray-300">{t('form.title')}</h3>

        <ActionStep
          title={t('form.source.label')}
          className="rounded bg-gray-700/60 px-4"
          titleClassName="font-semibold"
          leftIcon={<TbStepOut aria-hidden={true} />}
        >
          <GreyAccountSelect
            selectedAccount={actionData.account}
            triggerClassName="text-xs"
            onSelect={handleChangeAccount}
          />
        </ActionStep>

        <ActionStepSeparator className="bg-gray-700/60" />

        <div className="relative mt-2 flex w-full flex-col gap-3">
          <div className="w-full rounded bg-gray-800">
            <div className="flex w-full flex-col items-center rounded bg-gray-700/60 px-3.5">
              <ActionStep
                title={t('form.receive.label')}
                titleClassName="font-semibold"
                leftIcon={<TbStepInto aria-hidden={true} />}
              />

              <Separator />

              <ActionStep
                title={t('form.token.label')}
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
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
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
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
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                footer={
                  <div className="flex w-full justify-between text-xs italic text-gray-100">
                    <p>{t('labels.fiat', { currencyLabel: currency.label })}</p>

                    <p>
                      {NumberHelper.currency(
                        actionData.amount && actionData.token
                          ? NumberHelper.number(actionData.amount) * actionData.token.exchangeConvertedPrice
                          : 0,
                        currency.label,
                        { maximumFractionDigits: 6 }
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

        {(actionState.errors.fee || actionState.errors.account) && (
          <AlertErrorBanner
            className="mt-2 w-full"
            message={actionState.errors.fee || actionState.errors.account || ''}
          />
        )}

        <Button
          label={t('buttons.submit')}
          className="mx-auto mt-12 w-full max-w-[18rem]"
          iconsOnEdge={false}
          flat
          type="submit"
          loading={actionState.isActing}
          disabled={
            !actionState.isValid ||
            isInvalidForm ||
            actionData.isFeeLoading ||
            !!Object.values(actionState.errors ?? {}).length ||
            (isServiceCalculableFee && !actionData.fee)
          }
          leftIcon={<TbStepOut aria-hidden={true} />}
        />
      </form>
    </SideModalLayout>
  )
}
