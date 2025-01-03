import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward } from 'react-icons/md'
import { TbArrowDown, TbPlus, TbStepOut } from 'react-icons/tb'
import { Account, hasLedger, IntentTransferParam, isCalculableFee } from '@cityofzion/blockchain-service'
import { ActionStep } from '@renderer/components/ActionStep'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { AnimatePresence } from 'framer-motion'

import { SendErrorModalContent } from './SendErrorModalContent'
import { SendRecipient, TSendRecipient } from './SendRecipient'
import { SendSuccessModalContent } from './SendSuccessModalContent'

type TActionsData = {
  selectedAccount?: IAccountState
  recipients: TSendRecipient[]
  fee?: string
  isCalculatingFee: boolean
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
  const dispatch = useAppDispatch()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { modalNavigate } = useModalNavigate()
  const currentRecipientAddress = useRef(recipientAddress)

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TActionsData>({
    selectedAccount: undefined,
    recipients: [],
    isCalculatingFee: false,
    fee: undefined,
  })

  const balance = useBalance(actionData.selectedAccount)

  const service = useMemo(
    () =>
      actionData.selectedAccount
        ? bsAggregator.blockchainServicesByName[actionData.selectedAccount.blockchain]
        : undefined,
    [actionData.selectedAccount]
  )

  const getSendFields = async () => {
    if (
      !currentLoginSessionRef.current ||
      !actionData.selectedAccount ||
      !actionData.selectedAccount.encryptedKey ||
      !service ||
      actionState.errors.recipients !== undefined ||
      !actionState.changed.recipients
    )
      return

    const intents: IntentTransferParam[] = actionData.recipients.map(recipient => ({
      amount: recipient.amount!,
      receiverAddress: recipient.address!,
      tokenHash: recipient.token!.token.hash,
      tokenDecimals: recipient.token!.token.decimals,
    }))

    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: actionData.selectedAccount.encryptedKey,
      encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
    })

    let serviceAccount: Account<TBlockchainServiceKey>

    if (actionData.selectedAccount.type === 'hardware' && hasLedger(service)) {
      serviceAccount = service.generateAccountFromPublicKey(key)
      serviceAccount.isHardware = true
      serviceAccount.bip44Path = service.bip44DerivationPath.replace('?', actionData.selectedAccount.order.toString())
    } else {
      serviceAccount = service.generateAccountFromKey(key)
    }

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
        if (!recipient.amount) {
          clearErrors('selectedAccount')
        }

        setError('recipients', '')
        return
      }

      const amountNumber = NumberHelper.number(recipient.amount)
      const tokenHash = UtilsHelper.normalizeHash(recipient.token!.token.hash)
      const tokenBalance = balance.data?.tokensBalances.find(
        tokenBalance => UtilsHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
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

  const handleUpdateRecipient = (id: string, newRecipients: Partial<TSendRecipient>) => {
    if (newRecipients.address) currentRecipientAddress.current = undefined

    handleSetRecipients(prev =>
      prev.map(recipient => (recipient.id === id ? { ...recipient, ...newRecipients } : recipient))
    )
  }

  const handleAddRecipient = () => {
    handleSetRecipients(prev => [...prev, { id: UtilsHelper.uuid() }])
  }

  const handleSubmit = async () => {
    const fields = await getSendFields()
    if (!fields) return

    try {
      const transactionHashes = await fields.service.transfer({
        senderAccount: fields.serviceAccount,
        intents: fields.intents,
      })

      const transactions = transactionHashes.map((hash, index) => {
        if (!hash) return
        const recipient = actionData.recipients[index]
        const transaction: TUseTransactionsTransfer = {
          account: fields.selectedAccount,
          amount: recipient.amount!,
          asset: recipient.token!.token.symbol,
          to: recipient.address!,
          from: fields.selectedAccount.address,
          hash,
          time: Date.now() / 1000,
          fromAccount: fields.selectedAccount,
          toAccount: accountsRef.current.find(account => account.address === recipient.address),
          isPending: true,
        }

        dispatch(
          authReducerActions.waitPendingTransaction({
            transaction,
            blockchainService: fields.service,
            network: networkByBlockchain[fields.selectedAccount.blockchain],
            account: fields.serviceAccount,
          })
        )
        return transaction
      })
      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut />,
          subtitle: t('sendSuccess.title'),
          content: <SendSuccessModalContent transactions={transactions} selectedAccount={fields.selectedAccount} />,
        },
      })
    } catch (error: any) {
      console.error(error)
      modalNavigate('error', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut />,
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

    const abortController = new AbortController()

    const handleCalculateFee = async () => {
      try {
        // It works as a debounce
        await UtilsHelper.sleep(1000)
        if (abortController.signal.aborted) return

        const fields = await getSendFields()
        if (!fields || !isCalculableFee(fields.service)) {
          setData({ fee: undefined })
          return
        }

        setData({ isCalculatingFee: true })

        const fee = await fields.service.calculateTransferFee({
          intents: fields.intents,
          senderAccount: fields.serviceAccount,
        })

        setData({
          fee,
        })

        let totalFeeAmount = NumberHelper.number(fee)

        fields.intents.forEach(intent => {
          if (UtilsHelper.normalizeHash(intent.tokenHash) !== UtilsHelper.normalizeHash(fields.service.feeToken.hash))
            return

          totalFeeAmount += NumberHelper.number(intent.amount)
        })

        const feeBalanceNumber =
          balance.data?.tokensBalances.find(
            ({ token }) =>
              UtilsHelper.normalizeHash(token.hash) === UtilsHelper.normalizeHash(fields.service.feeToken.hash)
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

    return () => {
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.recipients, balance.data])

  useEffect(() => {
    handleSelectAccount(account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <section className="bg-gray-800 min-h-0 flex-grow w-full flex flex-col px-4 rounded text-sm items-center">
      <h2 className="text-white text-left w-full mt-4 mb-3">{t('subtitle')}</h2>

      <Separator />

      <div className="max-w-[33.25rem] min-h-0 w-full flex-grow flex flex-col items-center py-8 my-2 px-5 overflow-auto">
        <ActionStep className="bg-gray-700/60 rounded px-4" title={t('sourceAccountLabel')} leftIcon={<TbStepOut />}>
          <GreyAccountSelect onSelect={handleSelectAccount} selectedAccount={actionData.selectedAccount} />
        </ActionStep>

        <div className="relative z-10">
          <TbArrowDown className="w-5 h-5 p-1 bg-gray-600 rounded-full border-8 border-gray-800 box-content absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="w-full flex flex-col gap-3 mt-2 relative">
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
              />
            ))}
          </AnimatePresence>
        </div>

        <Button
          leftIcon={<TbPlus />}
          label={t('addRecipientButtonLabel')}
          flat
          variant="text"
          iconsOnEdge={false}
          disabled={!actionData.selectedAccount}
          colorSchema={!actionData.selectedAccount ? 'white' : 'neon'}
          className="mt-2 w-64"
          onClick={handleAddRecipient}
        />

        {actionData.selectedAccount &&
          NetworkHelper.isBlockchainEthereumOrBasedOnEthereum(actionData.selectedAccount.blockchain) &&
          actionData.recipients.length > 1 && (
            <Banner
              type="warning"
              className="w-full mt-2"
              message={t('separatelyTransferWarning', {
                blockchain: commonT(`blockchain.${actionData.selectedAccount.blockchain}`),
              })}
            />
          )}

        {(!service || (service && isCalculableFee(service))) && (
          <TransactionFeeActionStep
            fee={actionData.fee}
            isCalculatingFee={actionData.isCalculatingFee}
            service={service}
          />
        )}

        {(actionState.errors.fee || actionState.errors.selectedAccount) && (
          <AlertErrorBanner
            className="w-full mt-2"
            message={actionState.errors.fee || actionState.errors.selectedAccount || ''}
          />
        )}

        <Button
          className="max-w-[16rem] w-full mt-4"
          iconsOnEdge={false}
          onClick={handleAct(handleSubmit)}
          label={commonT('general.continue')}
          loading={actionState.isActing}
          rightIcon={<MdArrowForward />}
          disabled={
            !actionState.isValid ||
            !actionData.selectedAccount ||
            !!actionState.errors.fee ||
            !!actionState.errors.recipients ||
            !service ||
            (isCalculableFee(service) && !actionData.fee)
          }
        />
      </div>
    </section>
  )
}
