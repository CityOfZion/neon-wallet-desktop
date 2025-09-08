import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { BSBigNumberHelper, IntentTransferParam, isCalculableFee } from '@cityofzion/blockchain-service'
import MdArrowForward from '@renderer/assets/images/md-arrow-forward.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { thunks } from '@renderer/store/thunks'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { AnimatePresence } from 'framer-motion'
import { lte } from 'lodash'

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
}

type TProps = {
  account?: IAccountState
  recipientAddress?: string
}

export const SendPageContent = ({ account, recipientAddress }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { t: commonT } = useTranslation('common')
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accountsRef } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const currentRecipientAddress = useRef(recipientAddress)
  const isDisabledMaxAmountRef = useRef(false)
  const dispatch = useAppDispatch()

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TActionsData>({
    selectedAccount: undefined,
    recipients: [],
    isCalculatingFee: false,
    fee: undefined,
  })

  const isCalculatingMaxAmount = isDisabledMaxAmountRef.current || actionData.isLoadingMaxAmount
  const isCalculatingForm = isCalculatingMaxAmount || actionData.isCalculatingFee
  const isAccountDisabled = !actionData.selectedAccount || isCalculatingForm
  const balance = useBalance(actionData.selectedAccount)

  const service = useMemo(
    () =>
      actionData.selectedAccount
        ? bsAggregator.blockchainServicesByName[actionData.selectedAccount.blockchain]
        : undefined,
    [actionData.selectedAccount]
  )

  const getSendFields = () => {
    if (
      !currentLoginSessionRef.current ||
      !actionData.selectedAccount ||
      !actionData.selectedAccount.encryptedKey ||
      !service ||
      actionState.errors.recipients !== undefined ||
      !actionState.changed.recipients ||
      actionData.recipients.some(recipient => !!recipient.isAmountLoading)
    )
      return

    const intents: IntentTransferParam[] = actionData.recipients.map(recipient => ({
      amount: recipient.amount!,
      receiverAddress: recipient.address!,
      tokenHash: recipient.token!.token.hash,
      tokenDecimals: recipient.token!.token.decimals,
    }))
    const key = window.api.sendSync('decryptBasedEncryptedSecretSync', {
      value: actionData.selectedAccount.encryptedKey,
      encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account: actionData.selectedAccount, key })

    return {
      service,
      serviceAccount,
      selectedAccount: actionData.selectedAccount,
      intents,
    }
  }

  const handleSetRecipients = (setRecipients: (prevRecipients: TSendRecipient[]) => TSendRecipient[]) => {
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

      const amountNumber = NumberHelper.number(recipient.amount)

      const tokenBalance = balance.data?.tokensBalances?.find(tokenBalance =>
        service?.tokenService?.predicateByHash(recipient.token!.token, tokenBalance.token)
      )

      if (!tokenBalance || amountNumber > tokenBalance.amountNumber) {
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
    if (lte(amount, 0)) ToastHelper.error({ message: t('errors.amountIsLessOrEqualZero') })
    else {
      try {
        handleUpdateRecipient(id, {
          amount: BSBigNumberHelper.format(amount, { decimals }),
        })
      } catch (error) {
        console.error(error)
      }
    }
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
        recipient.token.amountNumber - NumberHelper.number(actionData.fee ?? '0'),
        decimals
      )

      return
    }

    isDisabledMaxAmountRef.current = true
    setData({ isLoadingMaxAmount: true, maxAmountRecipientId: recipient.id })

    try {
      const intents = actionData.recipients
        .map(currentRecipient => {
          const receiverAddress = currentRecipient.address
          const tokenHash = currentRecipient.token?.token?.hash
          const amount = currentRecipient.id === recipient.id ? currentRecipient.token?.amount : currentRecipient.amount

          if (!receiverAddress || !tokenHash || !amount) return null

          return { receiverAddress, tokenHash, amount, tokenDecimals: currentRecipient.token!.token.decimals }
        })
        .filter(recipient => recipient !== null) as IntentTransferParam[]

      const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: encryptedKey,
        encryptedSecret: encryptedPassword,
      })

      const senderAccount = AccountHelper.getServiceAccount({ account: selectedAccount, key })

      const fee = await service.calculateTransferFee({ intents, senderAccount })

      handleUpdateRecipientAmount(recipient.id, recipient.token.amountNumber - NumberHelper.number(fee), decimals)
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('errors.calculateMaxAmount') })
    } finally {
      isDisabledMaxAmountRef.current = false
      setData({ isLoadingMaxAmount: false, maxAmountRecipientId: '' })
    }
  }

  const handleSubmit = async () => {
    const fields = getSendFields()

    if (!fields || isCalculatingForm) return

    if (fields.selectedAccount?.type === 'hardware') {
      const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(fields.selectedAccount)

      if (!isConnectedAndUnlocked) {
        ToastHelper.error({ message: t('errors.hardwareWalletShouldBeValid'), duration: 8000 })

        return
      }
    }

    try {
      const transactionHashes = await fields.service.transfer({
        senderAccount: fields.serviceAccount,
        intents: fields.intents,
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
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut aria-hidden={true} />,
          subtitle: t('sendSuccess.title'),
          content: <SendSuccessModalContent transactions={transactions} selectedAccount={fields.selectedAccount} />,
        },
      })
    } catch (error: any) {
      console.error(error)
      modalNavigate('error', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut aria-hidden={true} />,
          subtitle: t('sendFail.title'),
          description: t('sendFail.subtitle'),
          content: <SendErrorModalContent error={error.message} />,
        },
      })
    } finally {
      reset()
      currentRecipientAddress.current = undefined
      handleSelectAccount()
    }
  }

  useEffect(() => {
    if (balance.isLoading) return

    const handleCalculateFee = async () => {
      try {
        const fields = getSendFields()

        if (!fields || !isCalculableFee(fields.service)) {
          setData({ fee: undefined })
          return
        }

        setData({ isCalculatingFee: true })

        const fee = await fields.service.calculateTransferFee({
          intents: fields.intents,
          senderAccount: fields.serviceAccount,
        })

        setData({ fee })

        let totalFeeAmount = NumberHelper.number(fee)

        fields.intents.forEach(intent => {
          if (!fields.service.tokenService.predicateByHash(fields.service.feeToken, intent.tokenHash)) return

          totalFeeAmount += NumberHelper.number(intent.amount)
        })

        const feeBalanceNumber =
          balance.data?.tokensBalances?.find(({ token }) =>
            fields.service.tokenService.predicateByHash(fields.service.feeToken, token)
          )?.amountNumber ?? 0

        if (totalFeeAmount > feeBalanceNumber) {
          setError('fee', t('errors.insufficientFunds'))
        } else {
          clearErrors('fee')
        }
      } catch (error) {
        console.error(error)
        ToastHelper.error({ message: t('errors.feeError') })
        setError('fee', t('errors.feeError'))
        setData({ fee: undefined })
        throw error
      } finally {
        setData({ isCalculatingFee: false })
      }
    }

    handleCalculateFee()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.recipients, balance.data])

  useEffect(() => {
    handleSelectAccount(account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <section className="flex min-h-0 w-full flex-grow flex-col items-center rounded bg-gray-800 px-4 text-sm">
      <h2 className="mb-3 mt-4 w-full text-left text-white">{t('subtitle')}</h2>

      <Separator />

      <div className="my-2 flex min-h-0 w-full max-w-[33.25rem] flex-grow flex-col items-center overflow-auto px-5 py-8">
        <ActionStep
          className="rounded bg-gray-700/60 px-4"
          title={t('sourceAccountLabel')}
          leftIcon={<TbStepOut aria-hidden={true} />}
        >
          <GreyAccountSelect
            onSelect={handleSelectAccount}
            disabled={isCalculatingForm}
            selectedAccount={actionData.selectedAccount}
          />
        </ActionStep>

        <ActionStepSeparator />

        <div className="relative mt-2 flex w-full flex-col gap-3">
          <AnimatePresence>
            {actionData.recipients.map((recipient, index) => (
              <SendRecipient
                key={recipient.id}
                onRemoveRecipient={() => handleRemoveRecipient(recipient.id)}
                onUpdateRecipient={updatedRecipient => handleUpdateRecipient(recipient.id, updatedRecipient)}
                order={index + 1}
                selectedAccount={actionData.selectedAccount}
                recipient={recipient}
                removable={actionData.recipients.length > 1}
                balance={balance}
                isLoadingMaxAmount={actionData.maxAmountRecipientId === recipient.id}
                isDisabledMaxAmount={isCalculatingForm}
                onMaxAmount={handleMaxAmount}
              />
            ))}
          </AnimatePresence>
        </div>

        <Button
          leftIcon={<TbPlus aria-hidden={true} />}
          label={t('addRecipientButtonLabel')}
          flat
          variant="text"
          iconsOnEdge={false}
          disabled={isAccountDisabled}
          colorSchema={isAccountDisabled ? 'white' : 'neon'}
          className="mt-2 w-64"
          onClick={handleAddRecipient}
        />

        {actionData.selectedAccount &&
          NetworkHelper.isBlockchainEthereumOrBasedOnEthereum(actionData.selectedAccount.blockchain) &&
          actionData.recipients.length > 1 && (
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

        {(actionState.errors.fee || actionState.errors.selectedAccount) && (
          <AlertErrorBanner
            className="mt-2 w-full"
            message={actionState.errors.fee || actionState.errors.selectedAccount || ''}
          />
        )}

        <Button
          className="mt-4 w-full max-w-[16rem]"
          iconsOnEdge={false}
          onClick={handleAct(handleSubmit)}
          label={commonT('general.continue')}
          loading={actionState.isActing}
          rightIcon={<MdArrowForward aria-hidden={true} />}
          disabled={
            !actionState.isValid ||
            !actionData.selectedAccount ||
            !!actionState.errors.fee ||
            !!actionState.errors.recipients ||
            !service ||
            isCalculatingForm ||
            (isCalculableFee(service) && !actionData.fee)
          }
        />
      </div>
    </section>
  )
}
