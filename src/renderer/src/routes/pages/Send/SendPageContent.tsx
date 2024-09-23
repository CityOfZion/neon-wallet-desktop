import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowDown, TbPlus, TbStepOut } from 'react-icons/tb'
import {
  Account,
  BlockchainService,
  hasLedger,
  IntentTransferParam,
  isCalculableFee,
} from '@cityofzion/blockchain-service'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useLoginSessionSelector, useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { Recipient } from './Recipient'
import { SelectAccount } from './SelectAccount'
import { SuccessModalContent } from './SuccessModalContent'
import { TotalFee } from './TotalFee'

export enum SendPageStep {
  SelectAccount = 1,
  SelectContact = 2,
  SelectToken = 3,
  SelectAmount = 4,
}

type TActionsData = {
  selectedAccount?: IAccountState
  fee?: string
}

export type TRecipient = {
  id: string
  selectedToken?: TTokenBalance
  selectedAmount?: string
  selectedRecipient?: string
}

type TProps = {
  account?: IAccountState
  recipient?: string
}

export type TSendServiceResponse =
  | {
      serviceAccount: Account
      selectedAccount: IAccountState
      service: BlockchainService<TBlockchainServiceKey>
      intents: IntentTransferParam[]
    }
  | undefined

export const SendPageContent = ({ account, recipient }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { loginSessionRef } = useLoginSessionSelector()
  const { t: commonT } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { accountsRef } = useAccountsSelector()

  const [originalRecipient, setoOriginalRecipient] = useState(recipient)
  const [recipients, setRecipients] = useState<TRecipient[]>([
    { selectedRecipient: originalRecipient, id: UtilsHelper.uuid() },
  ])

  const { isValidAddressOrDomainAddress, isValidatingAddressOrDomainAddress, validateAddressOrNS } = useNameService()

  const { actionData, actionState, setData, setError, handleAct, reset } = useActions<TActionsData>({})

  const hasInvalidRecipient = useMemo(() => {
    const isValidRecipient = (recipient: TRecipient) => {
      const { selectedRecipient, selectedToken, selectedAmount } = recipient
      validateAddressOrNS(selectedRecipient, actionData.selectedAccount?.blockchain)
      return isValidAddressOrDomainAddress && selectedToken && selectedAmount
    }

    return recipients.some(recipient => !isValidRecipient(recipient))
  }, [recipients, isValidAddressOrDomainAddress, validateAddressOrNS, actionData.selectedAccount?.blockchain])

  const service = useMemo(() => {
    if (!actionData.selectedAccount) return
    return bsAggregator.blockchainServicesByName[actionData.selectedAccount.blockchain]
  }, [actionData.selectedAccount])

  const getSendFields = useCallback(async (): Promise<TSendServiceResponse> => {
    if (!loginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    if (!actionData.selectedAccount || !actionData.selectedAccount.encryptedKey || !service)
      if (!actionData.selectedAccount || !actionData.selectedAccount.encryptedKey || !service || hasInvalidRecipient)
        return

    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: actionData.selectedAccount.encryptedKey,
      encryptedSecret: loginSessionRef.current.encryptedPassword,
    })

    const serviceAccount =
      actionData.selectedAccount.type === 'hardware' && hasLedger(service)
        ? service.generateAccountFromPublicKey(key)
        : service.generateAccountFromKey(key)

    const intents = recipients.map(
      (data: TRecipient) =>
        ({
          tokenHash: data.selectedToken?.token.hash,
          amount: data.selectedAmount,
          receiverAddress: data.selectedRecipient,
          tokenDecimals: data.selectedToken?.token.decimals,
        }) as IntentTransferParam
    )

    return {
      selectedAccount: actionData.selectedAccount,
      serviceAccount: serviceAccount,
      service: service,
      intents: intents,
    }
  }, [
    loginSessionRef,
    actionData.selectedAccount,
    service,
    actionData.selectedAccount,
    recipients,
    service,
    hasInvalidRecipient,
  ])

  const handleAddRecipient = () => {
    setRecipients([...recipients, { id: UtilsHelper.uuid() }])
  }

  const handleSelectAccount = (account: IAccountState) => {
    setData({
      selectedAccount: account,
    })

    const defaultRecipient = recipients[0]

    handleUpdateRecipient({ ...defaultRecipient, selectedRecipient: originalRecipient })
  }

  const handleUpdateRecipient = (updatedRecipient: TRecipient) => {
    if (updatedRecipient.selectedRecipient != recipient) {
      setoOriginalRecipient(undefined)
    }

    const updatedRecipients = recipients.map(recipient =>
      recipient.id === updatedRecipient.id ? { ...recipient, ...updatedRecipient } : recipient
    )

    setRecipients(updatedRecipients)
  }

  const handleRemoveRecipient = (id: string) => {
    const updatedRecipients = [...recipients]
    setRecipients(updatedRecipients.filter(updatedRecipient => updatedRecipient.id !== id))
  }

  const handleSelectFee = useCallback(
    (fee: string) => {
      setData({
        fee,
      })
    },
    [setData]
  )

  const handleSubmit = async () => {
    const fields = await getSendFields()
    if (!fields) return

    try {
      const isHardware = fields.selectedAccount.type === 'hardware'

      const transactionHashes = await fields.service.transfer({
        senderAccount: fields.serviceAccount,
        intents: fields.intents,
        isLedger: isHardware,
      })

      const hashRecipient = transactionHashes.map((hash, index) => ({
        hash: hash,
        recipient: recipients[index],
      }))

      hashRecipient.forEach(item => {
        const transaction: TUseTransactionsTransfer = {
          account: fields.selectedAccount,
          amount: item.recipient.selectedAmount!,
          asset: item.recipient.selectedToken!.token.symbol,
          to: item.recipient.selectedRecipient!,
          from: fields.selectedAccount.address,
          hash: item.hash,
          time: Date.now() / 1000,
          fromAccount: fields.selectedAccount,
          toAccount: accountsRef.current.find(a => a.address === item.recipient.selectedRecipient),
          isPending: true,
        }
        dispatch(accountReducerActions.addPendingTransaction(transaction))
        dispatch(
          accountReducerActions.watchPendingTransaction({
            transaction,
            blockchainService: fields.service,
            network: networkByBlockchain[fields.selectedAccount.blockchain],
          })
        )
      })

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut />,
          subtitle: t('sendSuccess.title'),
          content: <SuccessModalContent recipientsHash={hashRecipient} selectedAccount={fields.selectedAccount} />,
        },
      })
    } catch (error) {
      console.error(error)
      modalNavigate('error', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut />,
          subtitle: t('sendFail.title'),
          description: t('sendFail.subtitle'),
        },
      })
    } finally {
      reset()
      setRecipients([{ id: UtilsHelper.uuid() }])
    }
  }

  useLayoutEffect(() => {
    if (hasInvalidRecipient || !actionData.fee) return

    const feeNumber = NumberHelper.number(actionData.fee)

    const totalAmountsByToken: Record<string, { amount: number; balance: number }> = recipients.reduce(
      (acc, recipient) => {
        const token = recipient.selectedToken!.token.hash
        const amount = NumberHelper.number(recipient.selectedAmount!)
        const balance = recipient.selectedToken!.amountNumber

        if (!acc[token]) {
          acc[token] = { amount: 0, balance }
        }

        acc[token].amount += amount

        return acc
      },
      {}
    )

    Object.entries(totalAmountsByToken).some(([, { amount, balance }]) => {
      if (amount + feeNumber > balance) {
        setError('fee', t('error.insufficientFunds'))
        return
      }
    })
  }, [actionData.fee, recipients, setError, t, hasInvalidRecipient, actionData.selectedAccount?.blockchain])

  useLayoutEffect(() => {
    if (account) {
      handleSelectAccount(account)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  useLayoutEffect(() => {
    if (recipient) {
      const defaultRecipient = recipients[0]
      handleUpdateRecipient({ ...defaultRecipient, selectedRecipient: recipient })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient])

  return (
    <section className="bg-gray-800 h-full w-full flex flex-col px-4 rounded text-sm items-center max-h-svh overflow-y-scroll">
      <h2 className="text-white text-left w-full  mt-4 mb-3">{t('rightSideTitle')}</h2>

      <Separator />

      <div className="max-w-[32rem] w-full flex-grow flex flex-col items-center py-10 ">
        <div className="bg-gray-700/60 flex flex-col rounded px-3 w-full">
          <SelectAccount
            selectedAccount={actionData.selectedAccount}
            onSelectAccount={handleSelectAccount}
            active={!actionData.selectedAccount}
            title={t('sourceAccount')}
            modalTitle={t('selectAccountModal.title')}
            buttonLabel={t('selectAccountModal.selectSourceAccount')}
            leftIcon={<TbStepOut className="text-blue" />}
          />
        </div>

        <div className="relative">
          <TbArrowDown className="w-5 h-5 p-1 bg-gray-600 rounded-full border-8 border-gray-800 box-content absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="w-full flex flex-col">
          {recipients.map((recipient, index) => (
            <Recipient
              index={index}
              key={recipient.id}
              recipient={recipient}
              selectedAccount={actionData.selectedAccount}
              onUpdateRecipient={(recipient: TRecipient) => handleUpdateRecipient(recipient)}
              onRemoveRecipient={(id: string) => handleRemoveRecipient(id)}
            />
          ))}
        </div>

        <Button
          leftIcon={<TbPlus />}
          label={t('addRecipient')}
          flat
          variant="text"
          colorSchema="gray"
          className="my-2"
          onClick={handleAddRecipient}
        />

        {(actionData.selectedAccount?.blockchain === 'neox' || actionData.selectedAccount?.blockchain === 'ethereum') &&
          recipients.length > 1 && (
            <Banner
              className="my-4"
              type="warning"
              message={t('blockchainWarning', { blockchain: commonT(actionData.selectedAccount?.blockchain) })}
            />
          )}

        {service && isCalculableFee(service) && (
          <TotalFee
            getSendFields={getSendFields}
            onFeeChange={handleSelectFee}
            fee={actionData.fee}
            feeToken={service.feeToken}
            selectedAccount={actionData.selectedAccount}
          />
        )}

        {actionState.errors.fee && <AlertErrorBanner className="w-full mt-2" message={actionState.errors.fee} />}

        <Button
          className="max-w-[16rem] w-full mt-5"
          iconsOnEdge={false}
          onClick={handleAct(handleSubmit)}
          label={t('sendNow')}
          loading={actionState.isActing || isValidatingAddressOrDomainAddress}
          leftIcon={<TbStepOut />}
          disabled={
            !actionData.selectedAccount ||
            !service ||
            (isCalculableFee(service) && !actionData.fee) ||
            !actionState.isValid ||
            !getSendFields() ||
            isValidatingAddressOrDomainAddress
          }
        />
      </div>
    </section>
  )
}
