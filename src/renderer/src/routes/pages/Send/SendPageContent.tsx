import { useEffect, useMemo, useRef } from 'react'

import { BSBigNumberHelper, isCalculableFee, TIntentTransferParam } from '@cityofzion/blockchain-service'
import { lte } from 'lodash'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useConfirmAction } from '@renderer/hooks/useConfirmAction'
import { useExchange } from '@renderer/hooks/useExchange'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

import { SendTip } from '@renderer/routes/pages/Send/SendTip'

import MdArrowForward from '@renderer/assets/images/md-arrow-forward.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'

import { thunks } from '@renderer/store/thunks'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TUseTransactionsTransfer } from '@shared/types/hooks'
import { IAccountState } from '@shared/types/store'

import { SendErrorModalContent } from './SendErrorModalContent'
import { SendRecipient, TSendRecipient } from './SendRecipient'
import { SendSuccessModalContent } from './SendSuccessModalContent'

type TActionsData = {
  selectedAccount?: IAccountState
  recipients: TSendRecipient[]
  fee?: string
  isCalculatingFee: boolean
  isLoadingMaxAmount?: boolean
  maxAmountRecipientId?: string
  isTipChecked: boolean
  isTipDisabled: boolean
  tipAmountBn?: BigNumber
  tipFiatPriceBn?: BigNumber
  tipError?: string
}

type TProps = {
  account?: IAccountState
  recipientAddress?: string
}

export const SendPageContent = ({ account, recipientAddress }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { t: commonT } = useTranslation('common')
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accountsRef } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()
  const { confirmAction } = useConfirmAction()
  const dispatch = useAppDispatch()

  const currentRecipientAddress = useRef(recipientAddress)
  const isDisabledMaxAmountRef = useRef(false)

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TActionsData>({
    selectedAccount: undefined,
    recipients: [],
    isCalculatingFee: false,
    fee: undefined,
    isTipChecked: false,
    isTipDisabled: true,
  })

  const balanceQuery = useBalance(actionData.selectedAccount)

  const service = useMemo(
    () =>
      actionData.selectedAccount
        ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[actionData.selectedAccount.blockchain]
        : undefined,
    [actionData.selectedAccount]
  )

  const tipConfig = useMemo(() => ConstantsHelper.tipConfigByBlockchain.get(service?.name ?? ''), [service])

  const exchangeQuery = useExchange(
    service && tipConfig ? [{ blockchain: service.name, tokens: [tipConfig.token] }] : []
  )

  const isMainnetNetwork = service ? networkByBlockchain[service.name].type === 'mainnet' : false
  const isFeeInvalid = service ? isCalculableFee(service) && (!actionData.fee || !!actionState.errors.fee) : false
  const isCalculatingMaxAmount = isDisabledMaxAmountRef.current || actionData.isLoadingMaxAmount
  const isCalculatingForm = isCalculatingMaxAmount || actionData.isCalculatingFee
  const isAccountDisabled = !actionData.selectedAccount || isCalculatingForm
  const isAmountsLoading = actionData.recipients.some(recipient => !!recipient.isAmountLoading)
  const isMultiTransfer = actionData.recipients.length > 1

  const getSendFields = () => {
    if (
      !currentLoginSessionRef.current ||
      !actionData.selectedAccount ||
      !actionData.selectedAccount.encryptedKey ||
      !service ||
      actionState.errors.recipients !== undefined ||
      !actionState.changed.recipients ||
      isAmountsLoading
    )
      return

    const intents: TIntentTransferParam[] = actionData.recipients.map(recipient => ({
      amount: recipient.amount!,
      receiverAddress: recipient.address!,
      tokenHash: recipient.token!.token.hash,
      tokenDecimals: recipient.token!.token.decimals,
    }))
    const key = window.api.sendSync('encryption:decryptBasedEncryptedSecretSync', {
      value: actionData.selectedAccount.encryptedKey,
      encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account: actionData.selectedAccount, key })
    const { isTipChecked, isTipDisabled, tipAmountBn, tipFiatPriceBn } = actionData

    return {
      service,
      serviceAccount,
      selectedAccount: actionData.selectedAccount,
      intents,
      tipIntent:
        isTipChecked && !isTipDisabled && tipAmountBn && tipFiatPriceBn && tipConfig
          ? {
              amount: tipAmountBn.toFixed(),
              receiverAddress: tipConfig.address,
              tokenHash: tipConfig.token.hash,
              tokenDecimals: tipConfig.token.decimals,
            }
          : undefined,
    }
  }

  const handleSetRecipients = (setRecipients: (prevRecipients: TSendRecipient[]) => TSendRecipient[]) => {
    setData({ isTipChecked: false })

    let recipients: TSendRecipient[] = []

    setData(state => {
      recipients = setRecipients(state.recipients)

      return { recipients }
    })

    for (const recipient of recipients) {
      if (!recipient.token || !recipient.amount || !recipient.address) {
        if (!recipient.amount) clearErrors('selectedAccount')

        setError('recipients', '')

        return
      }

      const amountBn = BSBigNumberHelper.fromNumber(recipient.amount)

      const tokenBalance = balanceQuery.data?.tokensBalances?.find(tokenBalance =>
        service?.tokenService?.predicateByHash(recipient.token?.token?.hash ?? '', tokenBalance.token)
      )

      if (!tokenBalance || amountBn.isGreaterThan(tokenBalance.amount)) {
        setError('selectedAccount', t('errors.insufficientFunds'))

        return
      }
    }

    clearErrors(['recipients', 'selectedAccount'])
  }

  const handleSelectAccount = (account?: IAccountState) => {
    handleSetRecipients(() => [{ id: UtilsHelper.uuid(), addressInput: currentRecipientAddress.current }])
    setData({ selectedAccount: account })
  }

  const handleRemoveRecipient = (id: string) => {
    handleSetRecipients(prev => prev.filter(recipient => recipient.id !== id))
  }

  const handleUpdateRecipient = (id: string, newRecipient: Partial<TSendRecipient>) => {
    if (newRecipient.address) currentRecipientAddress.current = undefined

    handleSetRecipients(prev =>
      prev.map(recipient => (recipient.id === id ? { ...recipient, ...newRecipient } : recipient))
    )
  }

  const handleUpdateRecipientAmount = (id: string, amount: number, decimals?: number) => {
    if (lte(amount, 0)) {
      ToastHelper.error({ message: t('errors.amountIsLessOrEqualZero') })
      return
    }

    handleUpdateRecipient(id, {
      amount: BSBigNumberHelper.format(amount, { decimals }),
    })
  }

  const handleAddRecipient = () => {
    handleSetRecipients(prev => [...prev, { id: UtilsHelper.uuid() }])
  }

  const handleMaxAmount = async (recipient: TSendRecipient) => {
    const { selectedAccount } = actionData
    const encryptedKey = selectedAccount?.encryptedKey
    const encryptedPassword = currentLoginSessionRef.current?.encryptedPassword
    const decimals = recipient.token?.token?.decimals

    if (
      !encryptedPassword ||
      !encryptedKey ||
      !service ||
      !actionState.changed.recipients ||
      !recipient.id ||
      !recipient.address ||
      !recipient.token ||
      isCalculatingMaxAmount
    )
      return

    if (!service.tokenService.predicateByHash(service.feeToken, recipient.token.token)) {
      handleUpdateRecipientAmount(recipient.id, recipient.token.amountNumber, decimals)

      return
    }

    if (!isCalculableFee(service)) {
      handleUpdateRecipientAmount(
        recipient.id,
        BSBigNumberHelper.fromNumber(recipient.token.amount)
          .minus(actionData.fee ?? '0')
          .toNumber(),
        decimals
      )

      return
    }

    isDisabledMaxAmountRef.current = true
    setData({ isLoadingMaxAmount: true, maxAmountRecipientId: recipient.id, isTipChecked: false })

    try {
      const intents = actionData.recipients
        .map(currentRecipient => {
          const receiverAddress = currentRecipient.address
          const tokenHash = currentRecipient.token?.token?.hash
          const amount = currentRecipient.id === recipient.id ? currentRecipient.token?.amount : currentRecipient.amount

          if (!receiverAddress || !tokenHash || !amount) return null

          return { receiverAddress, tokenHash, amount, tokenDecimals: currentRecipient.token!.token.decimals }
        })
        .filter(recipient => recipient !== null) as TIntentTransferParam[]

      const key = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
        value: encryptedKey,
        encryptedSecret: encryptedPassword,
      })

      const senderAccount = AccountHelper.getServiceAccount({ account: selectedAccount, key })

      const fee = await service.calculateTransferFee({ senderAccount, intents })

      handleUpdateRecipientAmount(
        recipient.id,
        BSBigNumberHelper.fromNumber(recipient.token.amount).minus(fee).toNumber(),
        decimals
      )
    } catch (error) {
      console.error(error)
      ToastHelper.error({
        message: AppError.wrap(error, t('errors.calculateMaxAmount')).displayMessage,
        id: 'send-calculate-max-amount-error',
      })
    } finally {
      isDisabledMaxAmountRef.current = false
      setData({ isLoadingMaxAmount: false, maxAmountRecipientId: '' })
    }
  }

  const handleToggleTip = (isTipChecked: boolean) => {
    if (isTipChecked && actionData.tipError) {
      ToastHelper.error({ id: 'send-tip-error', message: actionData.tipError })

      return
    }

    setData({ isTipChecked })
  }

  const handleSubmit = async () => {
    const fields = getSendFields()

    if (!fields || isCalculatingForm || actionState.isActing || isFeeInvalid) return

    const account = fields.selectedAccount

    try {
      await confirmAction({ account })

      const transactionHashes = await fields.service.transfer({
        senderAccount: fields.serviceAccount,
        intents: fields.intents,
        tipIntent: fields.tipIntent,
      })

      const transactions = transactionHashes.map((hash, index) => {
        if (!hash) return
        const recipient = actionData.recipients[index]
        const token = recipient.token!.token

        // TODO: It is incorrect, we are add only one transfer but it could have multiple
        // Fix here: https://app.clickup.com/t/86a791t0c
        const transaction: TUseTransactionsTransfer = {
          account: fields.selectedAccount,
          amount: recipient.amount!,
          asset: token.symbol,
          assetHash: token.hash,
          token,
          to: recipient.address!,
          from: fields.selectedAccount.address,
          hash,
          time: DateHelper.getNowUnix(),
          fromAccount: fields.selectedAccount,
          toAccount: accountsRef.current.find(account => account.address === recipient.address),
          isPending: true,
        }

        dispatch(
          thunks.waitTransaction({
            transaction,
            successNotification: {
              title: 'pages:send.successNotification.title',
              previewBody: 'pages:send.successNotification.previewBody',
            },
            failureNotification: {
              title: 'pages:send.failureNotification.title',
              previewBody: 'pages:send.failureNotification.previewBody',
            },
          })
        )

        return transaction
      })

      reset()
      currentRecipientAddress.current = undefined
      handleSelectAccount()

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut aria-hidden />,
          subtitle: t('sendSuccess.title'),
          content: <SendSuccessModalContent transactions={transactions} selectedAccount={fields.selectedAccount} />,
        },
        replace: true,
      })

      reset()
      currentRecipientAddress.current = undefined
      handleSelectAccount()
    } catch (error) {
      console.error(error)

      const appError = AppError.wrap(error, null)

      if (appError.fromAppError) {
        ToastHelper.error({ message: appError.displayMessage })
        return
      }

      modalNavigate('error', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut aria-hidden />,
          subtitle: t('sendFail.title'),
          description: t('sendFail.subtitle'),
          content: <SendErrorModalContent error={appError.displayMessage} />,
        },
      })
    }
  }

  useEffect(() => {
    if (balanceQuery.isLoading || isAmountsLoading) return

    const handleCalculateFee = async () => {
      try {
        const fields = getSendFields()

        if (!fields || !isCalculableFee(fields.service)) {
          setData({ fee: undefined })
          return
        }

        setData({ isCalculatingFee: true })

        const fee = await fields.service.calculateTransferFee({
          senderAccount: fields.serviceAccount,
          intents: fields.intents,
          tipIntent: fields.tipIntent,
        })

        setData({ fee })

        let totalFeeAmountBn = BSBigNumberHelper.fromNumber(fee)

        fields.intents.forEach(intent => {
          if (!fields.service.tokenService.predicateByHash(fields.service.feeToken, intent.tokenHash)) return

          totalFeeAmountBn = totalFeeAmountBn.plus(intent.amount)
        })

        const feeBalance =
          balanceQuery.data?.tokensBalances?.find(({ token }) =>
            fields.service.tokenService.predicateByHash(fields.service.feeToken, token)
          )?.amount ?? '0'

        if (totalFeeAmountBn.isGreaterThan(feeBalance)) {
          setError('fee', t('errors.insufficientFunds'))
        } else {
          clearErrors('fee')
        }
      } catch (error: any) {
        console.error(error)
        const appError = AppError.wrap(error, t('errors.feeError'))
        ToastHelper.error({ message: appError.displayMessage, id: 'send-calculate-fee-error' })
        setError('fee', appError.displayMessage)
        setData({ fee: undefined })
      } finally {
        setData({ isCalculatingFee: false })
      }
    }

    handleCalculateFee()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.recipients, balanceQuery.data, actionData.isTipChecked])

  useEffect(() => {
    if (!service || !isMainnetNetwork || !tipConfig) {
      setData({
        isTipChecked: false,
        isTipDisabled: true,
        tipAmountBn: undefined,
        tipFiatPriceBn: undefined,
        tipError: undefined,
      })

      return
    }

    if (exchangeQuery.isLoading || isAmountsLoading || isCalculatingForm || actionState.isActing) {
      setData({ isTipDisabled: true, tipError: undefined })

      return
    }

    let totalFiatPricesBn = BSBigNumberHelper.fromNumber('0')
    let totalAmountsBn = BSBigNumberHelper.fromNumber(
      actionData.fee && service.tokenService.predicateByHash(service.feeToken, tipConfig.token) ? actionData.fee : '0'
    )

    actionData.recipients.forEach(recipient => {
      const amount = recipient.amount
      const tokenBalance = recipient.token
      const token = tokenBalance?.token

      if (!amount || !token) return

      const amountBn = BSBigNumberHelper.fromNumber(BSBigNumberHelper.format(amount, { decimals: token.decimals }))

      totalFiatPricesBn = totalFiatPricesBn.plus(amountBn.multipliedBy(tokenBalance.exchangeConvertedPrice))

      if (service.tokenService.predicateByHash(token, tipConfig.token)) {
        totalAmountsBn = totalAmountsBn.plus(amountBn)
      }
    })

    const isTipDisabled = isFeeInvalid || !actionState.isValid || !!actionState.errors.recipients

    if (totalFiatPricesBn.isLessThanOrEqualTo('0')) {
      setData({
        isTipChecked: false,
        isTipDisabled,
        tipAmountBn: undefined,
        tipFiatPriceBn: undefined,
        tipError: t('errors.noFiatPriceToTip'),
      })

      return
    }

    const tipTokenBalance = balanceQuery.data?.tokensBalances?.find(tokenBalance =>
      service.tokenService.predicateByHash(tokenBalance.token, tipConfig.token)
    )

    if (!tipTokenBalance) {
      setData({
        isTipChecked: false,
        isTipDisabled,
        tipAmountBn: undefined,
        tipFiatPriceBn: undefined,
        tipError: t('errors.noTokenToTip'),
      })

      return
    }

    const tokenFiatPrice = ExchangeHelper.getExchangeConvertedPrice(
      tipConfig.token.hash,
      service.name,
      exchangeQuery.data
    )

    let tipFiatPriceBn = totalFiatPricesBn.multipliedBy(ConstantsHelper.tipPercentageBn)
    let tipAmountBn = tipFiatPriceBn.div(tokenFiatPrice)

    if (tipAmountBn.isLessThan(tipConfig.minBn)) {
      tipFiatPriceBn = tipConfig.minBn.multipliedBy(tokenFiatPrice)
      tipAmountBn = tipConfig.minBn
    }

    totalAmountsBn = totalAmountsBn.plus(tipAmountBn)

    if (totalAmountsBn.isGreaterThan(tipTokenBalance.amount)) {
      setData({ isTipChecked: false, isTipDisabled, tipAmountBn, tipFiatPriceBn, tipError: t('errors.noAmountToTip') })

      return
    }

    setData({ isTipDisabled, tipAmountBn, tipFiatPriceBn, tipError: undefined })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    actionData.fee,
    actionData.recipients,
    actionState.errors.recipients,
    actionState.isActing,
    actionState.isValid,
    balanceQuery.data?.tokensBalances,
    exchangeQuery.data,
    exchangeQuery.isLoading,
    isAmountsLoading,
    isCalculatingForm,
    isFeeInvalid,
    isMainnetNetwork,
    service,
    tipConfig,
  ])

  useEffect(() => {
    handleSelectAccount(account)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <section className="flex min-h-0 w-full grow flex-col items-center rounded-sm bg-gray-800 px-4 text-sm">
      <h2 className="mt-4 mb-3 w-full text-left text-white">{t('subtitle')}</h2>

      <Separator />

      <div
        className="my-2 flex min-h-0 w-full max-w-133 grow flex-col items-center overflow-auto px-5 py-8"
        style={{ scrollbarGutter: 'stable' }}
      >
        <ActionStep
          className="rounded-sm bg-gray-700/60 px-4"
          title={t('sourceAccountLabel')}
          leftIcon={<TbStepOut aria-hidden />}
        >
          <GreyAccountSelect
            onSelect={handleSelectAccount}
            disabled={isCalculatingForm}
            selectedAccount={actionData.selectedAccount}
          />
        </ActionStep>

        <ActionStepSeparator />

        <div className="relative mt-2 flex w-full flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {actionData.recipients.map((recipient, index) => (
              <motion.div
                key={recipient.id}
                layout
                initial={isMultiTransfer ? { opacity: 0, y: -20, scale: 0.95 } : false}
                animate={isMultiTransfer ? { opacity: 1, y: 0, scale: 1 } : false}
                exit={isMultiTransfer ? { opacity: 0, y: -20, scale: 0.95 } : undefined}
                transition={{
                  duration: 0.2,
                  layout: { duration: 0.2 },
                }}
              >
                <SendRecipient
                  onRemoveRecipient={() => handleRemoveRecipient(recipient.id)}
                  onUpdateRecipient={updatedRecipient => handleUpdateRecipient(recipient.id, updatedRecipient)}
                  order={index + 1}
                  selectedAccount={actionData.selectedAccount}
                  recipient={recipient}
                  removable={isMultiTransfer}
                  balance={balanceQuery}
                  isLoadingMaxAmount={actionData.maxAmountRecipientId === recipient.id}
                  isDisabledMaxAmount={isCalculatingForm}
                  onMaxAmount={handleMaxAmount}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button
          leftIcon={<TbPlus aria-hidden />}
          label={t('addRecipientButtonLabel')}
          flat
          variant="text"
          iconsOnEdge={false}
          disabled={isAccountDisabled}
          colorSchema={isAccountDisabled ? 'white' : 'neon'}
          className="mt-2 w-64"
          onClick={handleAddRecipient}
        />

        {actionData.selectedAccount && !service?.isMultiTransferSupported && isMultiTransfer && (
          <Banner
            type="warning"
            className="mt-2 w-full"
            message={t('separatelyTransferWarning', {
              blockchain: commonT(`blockchain.${actionData.selectedAccount.blockchain}`),
            })}
          />
        )}

        {(!service || (service && isCalculableFee(service))) && (
          <TransactionFeeActionStep
            fee={actionData.fee ?? '0'}
            isCalculatingFee={actionData.isCalculatingFee}
            service={service}
          />
        )}

        {isMainnetNetwork && tipConfig && actionData.tipAmountBn && actionData.tipFiatPriceBn && (
          <SendTip
            className="mt-2"
            amountBn={actionData.tipAmountBn}
            fiatPriceBn={actionData.tipFiatPriceBn}
            token={tipConfig.token}
            isChecked={actionData.isTipChecked}
            isDisabled={actionData.isTipDisabled}
            isLoading={exchangeQuery.isLoading}
            onChange={handleToggleTip}
          />
        )}

        {(actionState.errors.fee || actionState.errors.selectedAccount) && (
          <AlertErrorBanner
            className="mt-2 w-full"
            message={actionState.errors.fee || actionState.errors.selectedAccount || ''}
          />
        )}

        <Button
          label={commonT('general.continue')}
          className="mt-6 mb-4 w-full max-w-[16rem]"
          iconsOnEdge={false}
          loading={actionState.isActing}
          disabled={
            !actionState.isValid ||
            !actionData.selectedAccount ||
            !!actionState.errors.recipients ||
            !service ||
            isCalculatingForm ||
            isFeeInvalid
          }
          rightIcon={<MdArrowForward aria-hidden />}
          onClick={handleAct(handleSubmit)}
        />
      </div>
    </section>
  )
}
