import { ChangeEvent, Dispatch, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepInto, TbStepOut } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import {
  Account,
  BlockchainService,
  BSCalculableFee,
  hasLedger,
  IntentTransferParam,
  isCalculableFee,
  Token,
} from '@cityofzion/blockchain-service'
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
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector, useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TDepositActionsData } from '@renderer/routes/pages/BuyAndSellTokens'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { debounce } from 'lodash'

import { SellTokensDepositErrorContent } from './SellTokensDepositErrorContent'
import { SellTokensDepositSuccessContent } from './SellTokensDepositSuccessContent'

type TLocationState = {
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  account?: IAccountState
}

export const SellTokensDepositModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit' })
  const dispatch = useAppDispatch()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accountsRef } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { currency } = useCurrencySelector()
  const { account, depositActionsData, setDepositActionsData } = useModalState<TLocationState>()

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TDepositActionsData>(
    depositActionsData ?? {
      amount: '',
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateAddress = useCallback(
    debounce(({ address, account }: { address: string; account?: IAccountState }) => {
      if (!address || !account || service!.validateAddress(address)) {
        clearErrors('address')

        return
      }

      setError('address', t('messages.invalidAddress'))
    }, 1500),
    [service]
  )

  const getServiceTransferParams = async () => {
    const { account, address } = actionData
    const token = actionData.token?.token
    const encryptedPassword = currentLoginSessionRef.current?.encryptedPassword

    if (!encryptedPassword || isInvalidForm) return

    const intent: IntentTransferParam = {
      amount: actionData.amount,
      receiverAddress: address,
      tokenHash: token!.hash,
      tokenDecimals: token!.decimals,
    }

    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: account!.encryptedKey!,
      encryptedSecret: encryptedPassword,
    })

    let serviceAccount: Account<TBlockchainServiceKey>

    if (account!.type === 'hardware' && hasLedger(service)) {
      serviceAccount = service.generateAccountFromPublicKey(key)
      serviceAccount.isHardware = true
      serviceAccount.bip44Path = AccountHelper.getBip44Path(service, account!.order)
    } else {
      serviceAccount = service.generateAccountFromKey(key)
    }

    return {
      serviceAccount,
      intent,
    }
  }

  const handleClose = () => {
    modalNavigate(-1)
    setDepositActionsData({ ...actionData, fee: undefined, isFeeLoading: false })
  }

  const handleChangeAccount = (account: IAccountState) => {
    setData({
      account,
      ...(account.blockchain !== actionData.account?.blockchain ? { token: undefined, amount: '' } : {}),
    })
  }

  const handleChangeAmount = (value: string) => {
    setData({ amount: NumberHelper.formatString(value, actionData.token?.token?.decimals, 24) })
  }

  const handleChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    const address = UtilsHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })

    setData({ address })
  }

  const handleChangeToken = (token: Token) => {
    const tokenHash = UtilsHelper.normalizeHash(token.hash)
    const tokenBalance = balanceData?.tokensBalances.find(
      tokenBalance => UtilsHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
    )

    setData({ token: tokenBalance, amount: '' })
  }

  const handleSubmit = async () => {
    const transferParams = await getServiceTransferParams()
    const { address, amount, token, account } = actionData

    if (!transferParams || actionData.isFeeLoading || isInvalidForm) return

    try {
      const { serviceAccount, intent } = transferParams
      const [transactionHash] = await service.transfer({
        senderAccount: serviceAccount,
        intents: [intent],
      })

      const transaction: TUseTransactionsTransfer = {
        account: account!,
        amount,
        asset: token!.token.symbol,
        to: address,
        from: account!.address,
        hash: transactionHash,
        time: Date.now() / 1000,
        fromAccount: account,
        toAccount: accountsRef.current.find(account => account.address === address),
        isPending: true,
      }

      dispatch(
        authReducerActions.waitPendingTransaction({
          transaction,
          blockchainService: service,
          network: networkByBlockchain[account!.blockchain],
          account: serviceAccount,
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
    validateAddress({ address: actionData.address, account: actionData.account })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.address, actionData.account])

  useEffect(() => {
    if (isBalanceLoading) return

    const abortController = new AbortController()

    const handleCalculateFee = async () => {
      try {
        await UtilsHelper.sleep(1500)

        if (abortController.signal.aborted) return

        const transferParams = await getServiceTransferParams()

        if (!transferParams || !isServiceCalculableFee || isInvalidForm) {
          setData({ fee: undefined })

          return
        }

        setData({ isFeeLoading: true })

        const { intent } = transferParams
        const feeTokenHash = UtilsHelper.normalizeHash(service.feeToken.hash)
        const fee = await (service as BlockchainService & BSCalculableFee).calculateTransferFee({
          senderAccount: transferParams.serviceAccount,
          intents: [intent],
        })

        setData({ fee })

        let totalFee = NumberHelper.number(fee)

        if (UtilsHelper.normalizeHash(intent.tokenHash) === feeTokenHash) totalFee += NumberHelper.number(intent.amount)

        const feeBalance =
          balanceData?.tokensBalances?.find(({ token }) => UtilsHelper.normalizeHash(token.hash) === feeTokenHash)
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

    return () => {
      abortController.abort()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.account, actionData.amount, actionData.address, actionData.token, balanceData])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbStepInto aria-hidden={true} />}
      contentClassName="flex flex-col overflow-y-auto"
      onClose={handleClose}
    >
      <p className="font-semibold mb-6">{t('description')}</p>

      <p className="mb-6">{t('observation')}</p>

      <Separator />

      <form className="flex flex-col mt-6" onSubmit={handleAct(handleSubmit)}>
        <h3 className="uppercase text-gray-300 font-bold mb-4">{t('form.title')}</h3>

        <ActionStep
          title={t('form.source.label')}
          className="bg-gray-700/60 rounded px-4"
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

        <div className="w-full flex flex-col gap-3 mt-2 relative">
          <div className="bg-gray-800  rounded w-full">
            <div className="flex flex-col items-center bg-gray-700/60  px-3.5 w-full rounded">
              <ActionStep
                title={t('form.receive.label')}
                titleClassName="font-semibold"
                leftIcon={<TbStepInto aria-hidden={true} />}
              />

              <Separator />

              <ActionStep
                title={t('form.token.label')}
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-300 w-2 h-2" />}
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
                leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-300 w-2 h-2" />}
              >
                <div className="flex flex-col w-full my-3 max-w-[62%]">
                  <div className="flex w-full gap-3 items-start">
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
                  </div>
                </div>
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.amount.label')}
                titleClassName="text-xs"
                leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-300 w-2 h-2" />}
              >
                <GreyAmountInput
                  value={actionData.amount}
                  disabled={isRecipientDisabled || !actionData.token}
                  onChange={handleChangeAmount}
                />
              </ActionStep>

              <div className="flex justify-between w-full pl-8 pb-4 text-gray-100 italic text-xs">
                <p>{t('labels.fiat', { currencyLabel: currency.label })}</p>
                <p>
                  {NumberHelper.currency(
                    actionData.amount && actionData.token
                      ? NumberHelper.number(actionData.amount) * actionData.token.exchangeConvertedPrice
                      : 0,
                    currency.label,
                    undefined,
                    6
                  )}
                </p>
              </div>
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
            className="w-full mt-2"
            message={actionState.errors.fee || actionState.errors.account || ''}
          />
        )}

        <Button
          label={t('buttons.submit')}
          className="max-w-[18rem] w-full mx-auto mt-12"
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
