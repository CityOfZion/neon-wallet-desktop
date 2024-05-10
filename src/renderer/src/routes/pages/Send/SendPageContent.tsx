import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowDown, TbStepOut } from 'react-icons/tb'
import { Account, BlockchainService, hasLedger, isCalculableFee } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { TokenBalance } from '@renderer/@types/query'
import { IAccountState } from '@renderer/@types/store'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'

import { Recipient } from './Recipient'
import { SelectAccount } from './SelectAccount'
import { SelectToken } from './SelectToken'
import { SendAmount } from './SendAmount'
import { SuccessModalContent } from './SuccessModalContent'
import { TotalFee } from './TotalFee'

enum SendPageStep {
  SelectAccount = 1,
  SelectToken = 2,
  SelectAmount = 3,
  SelectContact = 4,
}

type TActionsData = {
  selectedAccount?: IAccountState
  selectedToken?: TokenBalance
  selectedAmount?: string
  selectedRecipient?: string
  fee?: string
  currentStep: SendPageStep
}

type TProps = {
  account?: IAccountState
}

export type TSendServiceResponse =
  | {
      serviceAccount: Account
      selectedAccount: IAccountState
      selectedToken: TokenBalance
      selectedAmount: string
      selectedRecipientAddress: string
      service: BlockchainService<TBlockchainServiceKey>
    }
  | undefined

export const SendPageContent = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()
  const { t: commonT } = useTranslation('common')
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()

  const {
    isNameService,
    validatedAddress,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
  } = useNameService()

  const { actionData, actionState, setData, setError, handleAct, reset } = useActions<TActionsData>({
    currentStep: SendPageStep.SelectAccount,
  })

  const service = useMemo(() => {
    if (!actionData.selectedAccount) return
    return bsAggregator.blockchainServicesByName[actionData.selectedAccount.blockchain]
  }, [actionData.selectedAccount])

  const getSendFields = useCallback(async (): Promise<TSendServiceResponse> => {
    if (
      !actionData.selectedAccount ||
      !actionData.selectedToken ||
      !actionData.selectedAmount ||
      !validatedAddress ||
      !actionData.selectedAccount.encryptedKey ||
      !service
    )
      return

    const key = await window.api.decryptBasedEncryptedSecret(
      actionData.selectedAccount.encryptedKey,
      encryptedPasswordRef.current
    )

    const serviceAccount =
      actionData.selectedAccount.type === 'ledger' && hasLedger(service)
        ? service.generateAccountFromPublicKey(key)
        : service.generateAccountFromKey(key)

    return {
      serviceAccount,
      selectedAccount: actionData.selectedAccount,
      selectedToken: actionData.selectedToken,
      selectedAmount: actionData.selectedAmount,
      selectedRecipientAddress: validatedAddress,
      service: service,
    }
  }, [
    actionData.selectedAccount,
    actionData.selectedToken,
    actionData.selectedAmount,
    encryptedPasswordRef,
    validatedAddress,
    service,
  ])

  const handleSelectAccount = (account: IAccountState) => {
    setData({
      selectedAccount: account,
      currentStep: SendPageStep.SelectToken,
      selectedToken: undefined,
      selectedAmount: undefined,
    })

    handleSelectRecipientAddress(undefined)
  }

  const handleSelectToken = (token: TokenBalance) => {
    setData({
      selectedToken: token,
      selectedAmount: undefined,
      currentStep: SendPageStep.SelectAmount,
    })
  }

  const handleSelectAmount = (amount: string) => {
    setData({
      selectedAmount: amount,
      currentStep: SendPageStep.SelectContact,
    })
  }

  const handleSelectRecipientAddress = async (recipientAddress?: string) => {
    setData({
      selectedRecipient: recipientAddress,
    })

    validateAddressOrNS(recipientAddress, actionData.selectedAccount?.blockchain)
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
      const isLedger = fields.selectedAccount.type === 'ledger'

      const sendPromise = fields.service.transfer({
        senderAccount: fields.serviceAccount,
        intent: {
          receiverAddress: fields.selectedRecipientAddress,
          tokenHash: fields.selectedToken.token.hash,
          amount: fields.selectedAmount,
          tokenDecimals: fields.selectedToken.token.decimals,
        },
        isLedger,
      })

      let transactionHash: string

      if (isLedger) {
        transactionHash = await ToastHelper.promise(sendPromise, { message: commonT('ledger.requestingPermission') })
      } else {
        transactionHash = await sendPromise
      }

      dispatch(
        accountReducerActions.addPendingTransaction({
          account: fields.selectedAccount,
          amount: fields.selectedAmount,
          token: fields.selectedToken.token,
          to: fields.selectedRecipientAddress,
          from: fields.selectedAccount.address,
          hash: transactionHash,
          time: Date.now() / 1000,
          contractHash: fields.selectedToken.token.hash,
          type: 'token',
          fromAccount: fields.selectedAccount,
          isPending: true,
        })
      )
      dispatch(accountReducerActions.watchPendingTransaction({ transactionHash, blockchainService: fields.service }))

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <TbStepOut />,
          subtitle: t('sendSuccess.title'),
          content: (
            <SuccessModalContent
              selectedAmount={fields.selectedAmount}
              selectedToken={fields.selectedToken}
              transactionHash={transactionHash}
              selectedAccount={fields.selectedAccount}
              selectedRecipientAddress={fields.selectedRecipientAddress}
            />
          ),
        },
      })
    } catch {
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
    }
  }

  useLayoutEffect(() => {
    if (!actionData.selectedToken || !actionData.selectedAmount || !actionData.fee) return

    const amountNumber = NumberHelper.number(actionData.selectedAmount)
    const balanceNumber = actionData.selectedToken.amountNumber
    const feeNumber = NumberHelper.number(actionData.fee)

    if (amountNumber + feeNumber > balanceNumber) {
      setError('fee', t('error.insufficientFunds'))
    }
  }, [actionData.fee, actionData.selectedAmount, actionData.selectedToken, setError, t])

  useLayoutEffect(() => {
    if (account) {
      handleSelectAccount(account)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <section className="bg-gray-800 h-full w-full flex flex-col px-4 rounded text-sm items-center">
      <h2 className="text-white text-left w-full  mt-4 mb-3">{t('rightSideTitle')}</h2>

      <Separator />

      <div className="max-w-[32rem] w-full flex-grow flex flex-col items-center py-10">
        <div className="bg-gray-700/60 flex flex-col rounded px-3 w-full">
          <SelectAccount
            selectedAccount={actionData.selectedAccount}
            onSelectAccount={handleSelectAccount}
            active={actionData.currentStep === SendPageStep.SelectAccount}
            title={t('sourceAccount')}
            modalTitle={t('selectAccountModal.title')}
            buttonLabel={t('selectAccountModal.selectSourceAccount')}
            leftIcon={<TbStepOut className="text-neon" />}
          />

          <Separator />

          <SelectToken
            selectedAccount={actionData.selectedAccount}
            selectedToken={actionData.selectedToken}
            onSelectToken={handleSelectToken}
            active={actionData.currentStep === SendPageStep.SelectToken}
          />

          <Separator />

          <SendAmount
            selectedAccount={actionData.selectedAccount}
            selectedToken={actionData.selectedToken}
            selectedAmount={actionData.selectedAmount}
            onSelectAmount={handleSelectAmount}
            active={actionData.currentStep === SendPageStep.SelectAmount}
          />
        </div>

        <div className="relative">
          <TbArrowDown className="w-5 h-5 p-1 bg-gray-600 rounded-full border-8 border-gray-800 box-content absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <Recipient
          selectedToken={actionData.selectedToken}
          selectedAmount={actionData.selectedAmount}
          selectedRecipient={actionData.selectedRecipient}
          active={actionData.currentStep === SendPageStep.SelectContact}
          onSelectRecipient={handleSelectRecipientAddress}
          loading={isValidatingAddressOrDomainAddress}
          selectedRecipientDomainAddress={isNameService ? validatedAddress : undefined}
          error={isValidAddressOrDomainAddress === false}
        />

        {(!service || (service && isCalculableFee(service))) && (
          <TotalFee getSendFields={getSendFields} onFeeChange={handleSelectFee} fee={actionData.fee} />
        )}

        {isValidAddressOrDomainAddress === false ? (
          <AlertErrorBanner className="w-full mt-2" message={t('error.invalidAddress')} />
        ) : (
          actionState.errors.fee && <AlertErrorBanner className="w-full mt-2" message={actionState.errors.fee} />
        )}

        <Button
          className="mt-auto max-w-[16rem] w-full"
          iconsOnEdge={false}
          onClick={handleAct(handleSubmit)}
          label={t('sendNow')}
          loading={actionState.isActing}
          leftIcon={<TbStepOut />}
          disabled={
            !actionData.selectedAccount ||
            !actionData.selectedToken ||
            !actionData.selectedAmount ||
            !validatedAddress ||
            !isValidAddressOrDomainAddress ||
            isValidatingAddressOrDomainAddress ||
            !service ||
            (isCalculableFee(service) && !actionData.fee) ||
            !actionState.isValid
          }
        />
      </div>
    </section>
  )
}
