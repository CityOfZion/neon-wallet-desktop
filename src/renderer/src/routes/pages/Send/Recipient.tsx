import { ChangeEvent, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepInto, TbUsers, TbWallet } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState, TContactAddress } from '@shared/@types/store'

import { SelectToken } from './SelectToken'
import { SendAmount } from './SendAmount'
import { SendPageStep, TRecipient } from './SendPageContent'

type TRecipientParams = {
  index: number
  selectedAccount?: IAccountState
  recipient: TRecipient
  onUpdateRecipient: (recipient: TRecipient) => Promise<void> | void
  onRemoveRecipient: (id: string) => void
}

type TRecipientActionsData = {
  currentStep: SendPageStep
} & TRecipient

export const Recipient = ({
  index,
  selectedAccount,
  recipient,
  onUpdateRecipient,
  onRemoveRecipient,
}: TRecipientParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { modalNavigateWrapper } = useModalNavigate()

  const {
    isNameService,
    validatedAddress,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
  } = useNameService()

  const { actionData, setData } = useActions<TRecipientActionsData>({
    currentStep: SendPageStep.SelectContact,
    selectedRecipient: recipient.selectedRecipient,
    id: recipient.id,
  })

  const handleSelectToken = (token: TTokenBalance) => {
    setData({
      selectedToken: token,
      selectedAmount: undefined,
      currentStep: SendPageStep.SelectAmount,
    })

    onUpdateRecipient({
      id: actionData.id,
      selectedRecipient: actionData.selectedRecipient,
      selectedToken: token,
      selectedAmount: undefined,
    })
  }

  const handleSelectAmount = (amount: string) => {
    setData({
      selectedAmount: amount,
    })

    onUpdateRecipient({
      id: actionData.id,
      selectedRecipient: actionData.selectedRecipient,
      selectedToken: actionData.selectedToken,
      selectedAmount: amount,
    })
  }

  const handleSelectRecipientAddress = async (recipientAddress?: string) => {
    validateAddressOrNS(recipientAddress, selectedAccount?.blockchain)

    setData({
      selectedRecipient: recipientAddress,
      currentStep: recipientAddress ? SendPageStep.SelectToken : SendPageStep.SelectContact,
    })

    onUpdateRecipient({ id: actionData.id, selectedRecipient: recipientAddress })
  }

  const handleSelectContact = (address: TContactAddress) => {
    handleSelectRecipientAddress(address.address)
  }

  const handleChangeRecipient = (event: ChangeEvent<HTMLInputElement>) => {
    handleSelectRecipientAddress(event.target.value)
  }

  useLayoutEffect(() => {
    if (recipient.selectedRecipient) {
      validateAddressOrNS(recipient.selectedRecipient, selectedAccount?.blockchain)
    }
  }, [recipient.selectedRecipient, selectedAccount?.blockchain, validateAddressOrNS])

  return (
    <div className="flex flex-col items-center bg-gray-700/60 rounded px-3 w-full mt-2">
      <div className="w-full flex justify-between items-center my-3">
        <div className="flex gap-3">
          <TbStepInto className="text-blue w-5 h-5" />
          <span>{t('recipient', { index: index + 1 })}</span>
        </div>

        {index > 0 && (
          <Button
            label={t('remove')}
            flat
            variant="text"
            textClassName="text-pink"
            onClick={() => onRemoveRecipient(recipient.id)}
          />
        )}
      </div>

      <Separator />

      <div className="py-4 px-6 flex flex-col items-center gap-1">
        <div className="flex flex-row items-start">
          <Input
            value={actionData.selectedRecipient ?? ''}
            onChange={handleChangeRecipient}
            compacted
            className="w-[24rem]"
            placeholder={t('addressInputHint')}
            clearable={false}
            loading={isValidatingAddressOrDomainAddress}
            errorMessage={isValidAddressOrDomainAddress === false ? t('error.invalidAddress') : undefined}
            rightIcon={<TbUsers />}
            rightIconClickAction={modalNavigateWrapper('select-contact', {
              state: {
                handleSelectContact: handleSelectContact,
                selectedToken: actionData.selectedToken,
              },
            })}
            disabled={!selectedAccount}
          />

          <Button
            className="flex items-center"
            colorSchema="white"
            disabled={true}
            variant="text"
            label={t('myAccounts')}
            leftIcon={<TbWallet />}
            flat
          />
        </div>

        {isNameService && <span className="text-neon text-left w-full text-xs">{validatedAddress}</span>}
      </div>

      <div className="w-full">
        <Separator />

        <SelectToken
          selectedAccount={selectedAccount}
          selectedToken={actionData.selectedToken}
          onSelectToken={handleSelectToken}
          active={actionData.currentStep === SendPageStep.SelectToken}
        />

        <Separator />

        <SendAmount
          selectedAccount={selectedAccount}
          selectedToken={actionData.selectedToken}
          selectedAmount={actionData.selectedAmount}
          onSelectAmount={handleSelectAmount}
          active={actionData.currentStep === SendPageStep.SelectAmount}
        />
      </div>
    </div>
  )
}
