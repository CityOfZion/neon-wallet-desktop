import { ChangeEvent, useEffect } from 'react'

import { BSBigNumberHelper, TBSToken } from '@cityofzion/blockchain-service'
import { useIsPresent } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import { TTokenBalance, TUseBalanceResult } from '@shared/types/query'
import { IAccountState, TContactAddress } from '@shared/types/store'

export type TSendRecipient = {
  id: string
  token?: TTokenBalance
  amount?: string
  isAmountLoading?: boolean
  address?: string
  addressInput?: string
}

type TProps = {
  order: number
  selectedAccount?: IAccountState
  recipient: TSendRecipient
  onUpdateRecipient: (recipient: Partial<TSendRecipient>) => void
  onRemoveRecipient: () => void
  removable?: boolean
  balance?: TUseBalanceResult
  isLoadingMaxAmount: boolean
  isDisabledMaxAmount: boolean
  onMaxAmount: (recipient: TSendRecipient) => void
}

export const SendRecipient = ({
  order,
  selectedAccount,
  recipient,
  onUpdateRecipient,
  onRemoveRecipient,
  removable = false,
  balance,
  isLoadingMaxAmount,
  isDisabledMaxAmount,
  onMaxAmount,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.recipient' })
  const { t: commonT } = useTranslation('common')
  const { modalNavigateWrapper } = useModalNavigate()
  const { currency } = useCurrencySelector()
  const isPresent = useIsPresent()
  const debounce = useDebounceFunction()

  const {
    isNameService,
    validatedAddress,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
  } = useNameService()

  const isDisabled = !selectedAccount || isDisabledMaxAmount
  const isAmountDisabled = isDisabled || !recipient.token || !recipient.address

  const handleChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    const address = StringHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false, allowDots: true })

    onUpdateRecipient({ addressInput: address, address: undefined })
  }

  const handleSelectContact = (address: TContactAddress) => {
    onUpdateRecipient({ addressInput: address.address, address: undefined })
  }

  const handleSelectToken = (token: TBSToken) => {
    const blockchain = balance?.data?.blockchain

    if (!blockchain) return

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

    const tokenBalance = balance.data?.tokensBalances?.find(tokenBalance =>
      service.tokenService.predicateByHash(token, tokenBalance.token)
    )

    onUpdateRecipient({ token: tokenBalance, amount: undefined })
  }

  const handleChangeAmount = (value: string) => {
    onUpdateRecipient({
      amount: value,
      isAmountLoading: true,
    })

    debounce(() => {
      onUpdateRecipient({
        amount: BSBigNumberHelper.format(value, { decimals: recipient.token?.token?.decimals }),
        isAmountLoading: false,
      })
    })
  }

  const handleSelectAccount = (account: IAccountState) => {
    onUpdateRecipient({ addressInput: account.address, address: undefined })
  }

  useEffect(() => {
    if (recipient.addressInput === undefined || !selectedAccount || !isPresent) return
    validateAddressOrNS(recipient.addressInput, selectedAccount.blockchain)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient.addressInput, selectedAccount, validateAddressOrNS])

  useEffect(() => {
    if (!isPresent) return
    onUpdateRecipient({ address: validatedAddress })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedAddress])

  return (
    <div className="flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-3.5">
      <ActionStep className="px-0" title={t('title', { order })} leftIcon={<TbStepInto aria-hidden />}>
        {removable && (
          <Button
            label={commonT('general.remove')}
            flat
            variant="text-slim"
            textClassName="text-pink"
            disabled={isDisabled}
            onClick={() => onRemoveRecipient()}
          />
        )}
      </ActionStep>

      <Separator />

      <div className="my-5 flex w-full flex-col">
        <div className="flex w-full items-start gap-3">
          <Input
            value={recipient.addressInput || ''}
            onChange={handleChangeAddress}
            compacted
            testId={`send-recipient-address-input-${order}`}
            className="w-full"
            placeholder={t('addressPlaceholder')}
            clearable={false}
            pastable
            rightElement={
              <IconButton
                icon={<TbUsers aria-hidden />}
                type="button"
                onClick={modalNavigateWrapper('select-contact', {
                  state: {
                    onSelectContact: handleSelectContact,
                    blockchain: selectedAccount?.blockchain,
                  },
                })}
                compacted
                disabled={isDisabled}
              />
            }
            loading={isValidatingAddressOrDomainAddress}
            errorMessage={isValidAddressOrDomainAddress === false ? t('errors.invalidAddress') : undefined}
            disabled={isDisabled}
          />

          <GreyAccountSelect
            onSelect={handleSelectAccount}
            withoutIndicator
            blockchains={selectedAccount ? [selectedAccount.blockchain] : undefined}
            disabled={isDisabled}
          >
            <Button
              disabled={isDisabled}
              variant="text"
              label={t('myAccountButtonLabel')}
              leftIcon={<TbWallet aria-hidden />}
              flat
            />
          </GreyAccountSelect>
        </div>

        {isNameService && <span className="text-neon mt-1 block text-xs">{validatedAddress}</span>}
      </div>

      <Separator />

      <ActionStep
        title={t('tokenToSendLabel')}
        className="px-0"
        leftIcon={<VscCircleFilled aria-hidden className="size-2 text-gray-300" />}
      >
        <GreyTokenSelect
          tokens={balance?.data?.tokensBalances.map(tokenBalance => tokenBalance.token) ?? []}
          balance={balance?.data}
          onSelect={handleSelectToken}
          selectedToken={recipient.token?.token}
          loading={balance?.isLoading}
          disabled={isDisabled}
        />
      </ActionStep>

      <Separator />

      <ActionStep
        title={t('amountLabel')}
        className="px-0"
        leftIcon={<VscCircleFilled aria-hidden className="size-2 text-gray-300" />}
      >
        <GreyAmountInput
          value={recipient.amount || ''}
          onChangeValue={handleChangeAmount}
          disabled={isAmountDisabled}
          maxButtonProps={{
            loading: isLoadingMaxAmount,
            disabled: isAmountDisabled,
            onClick: () => onMaxAmount(recipient),
          }}
        />
      </ActionStep>

      <div className="flex w-full justify-between gap-x-4 pb-3 pl-8">
        <span className="text-xs whitespace-nowrap text-gray-200 italic">
          {t('fiatLabel', { currency: currency.label })}
        </span>
        <span className="truncate text-xs text-gray-100 italic">
          {CurrencyHelper.format(
            recipient.amount && recipient.token
              ? BSBigNumberHelper.fromNumber(recipient.amount)
                  .multipliedBy(recipient.token.exchangeConvertedPrice)
                  .toFixed()
              : 0,
            { currency, maximumFractionDigits: 6 }
          )}
        </span>
      </div>
    </div>
  )
}
