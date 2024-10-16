import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MdArrowForward } from 'react-icons/md'
import { TbArrowDown, TbPlus, TbStepOut } from 'react-icons/tb'
import { Account, IntentTransferParam, isCalculableFee } from '@cityofzion/blockchain-service'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { SelectAccountStep } from '@renderer/components/SelectAccountStep'
import { Separator } from '@renderer/components/Separator'
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
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'
import { AnimatePresence } from 'framer-motion'

import { SendErrorModalContent } from './SendErrorModalContent'
import { SendFee } from './SendFee'
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

  const { actionData, actionState, setData, setError, clearErrors, handleAct, reset } = useActions<TActionsData>({
    selectedAccount: account,
    recipients: [{ id: UtilsHelper.uuid(), addressInput: recipientAddress }],
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
      !actionState.isValid ||
      actionState.errors.recipients
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

    const serviceAccount: Account =
      actionData.selectedAccount.type === 'hardware'
        ? {
            address: actionData.selectedAccount.address,
            key,
            type: 'publicKey',
            bip44Path: service.bip44DerivationPath.replace('?', actionData.selectedAccount.order.toString()),
          }
        : service.generateAccountFromKey(key)

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
        setError('recipients', '')
        return
      }
    }

    clearErrors('recipients')
  }

  const handleSelectAccount = (account: IAccountState) => {
    handleSetRecipients(() => [
      { id: UtilsHelper.uuid(), addressInput: actionState.changed.selectedAccount ? undefined : recipientAddress },
    ])
    setData({ selectedAccount: account })
  }

  const handleRemoveRecipient = (id: string) => {
    handleSetRecipients(prev => prev.filter(recipient => recipient.id !== id))
  }

  const handleUpdateRecipient = (id: string, newRecipients: Partial<TSendRecipient>) => {
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
        isLedger: fields.selectedAccount.type === 'hardware',
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
          authReducerActions.addPendingTransaction({
            transaction,
            blockchainService: fields.service,
            network: networkByBlockchain[fields.selectedAccount.blockchain],
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
    }
  }

  useEffect(() => {
    const handleCalculateFee = async () => {
      try {
        const fields = await getSendFields()
        if (!fields || !isCalculableFee(fields.service)) {
          setData({ fee: undefined })
          return
        }

        setData({ isCalculatingFee: true })

        const fee = await fields.service.calculateTransferFee({
          intents: fields.intents,
          senderAccount: fields.serviceAccount,
          isLedger: fields.selectedAccount.type === 'hardware',
        })

        setData({
          fee: `${fee} ${fields.service.feeToken.symbol}`,
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
        throw error
      } finally {
        setData({ isCalculatingFee: false })
      }
    }

    handleCalculateFee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData.recipients, balance.data])

  return (
    <section className="bg-gray-800 min-h-0 flex-grow w-full flex flex-col px-4 rounded text-sm items-center">
      <h2 className="text-white text-left w-full mt-4 mb-3">{t('subtitle')}</h2>

      <Separator />

      <div className="max-w-[33.25rem] min-h-0 w-full flex-grow flex flex-col items-center py-8 my-2 px-5 overflow-auto">
        <SelectAccountStep
          selectedAccount={actionData.selectedAccount}
          onSelectAccount={handleSelectAccount}
          active={true}
          title={t('sourceAccount.label')}
          modalTitle={t('sourceAccount.modalTitle')}
          modalButtonLabel={t('sourceAccount.modalButtonLabel')}
          leftIcon={<TbStepOut />}
        />

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
          (actionData.selectedAccount.blockchain === 'neox' || actionData.selectedAccount.blockchain === 'ethereum') &&
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
          <SendFee fee={actionData.fee} isCalculatingFee={actionData.isCalculatingFee} service={service} />
        )}

        {actionState.errors.fee && <AlertErrorBanner className="w-full mt-2" message={actionState.errors.fee} />}

        <Button
          className="max-w-[16rem] w-full mt-8"
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
