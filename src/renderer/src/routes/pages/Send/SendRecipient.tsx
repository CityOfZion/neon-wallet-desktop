import { ChangeEvent, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BSBigNumberHelper, BSTokenHelper, Token } from '@cityofzion/blockchain-service'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'
import { ActionStep } from '@renderer/components/ActionStep'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance, TUseBalanceResult } from '@shared/@types/query'
import { IAccountState, TContactAddress } from '@shared/@types/store'
import { motion, useIsPresent } from 'framer-motion'

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
    const address = UtilsHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false, allowDots: true })

    onUpdateRecipient({ addressInput: address, address: undefined })
  }

  const handleSelectContact = (address: TContactAddress) => {
    onUpdateRecipient({ addressInput: address.address, address: undefined })
  }

  const handleSelectToken = (token: Token) => {
    const tokenHash = BSTokenHelper.normalizeHash(token.hash)
    const tokenBalance = balance?.data?.tokensBalances.find(
      tokenBalance => BSTokenHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
    )

    onUpdateRecipient({ token: tokenBalance, amount: undefined })
  }

  const handleChangeAmount = (value: string) => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectAccount = (account: IAccountState) => {
    onUpdateRecipient({ addressInput: account.address, address: undefined })
  }

  useEffect(() => {
    if (recipient.addressInput === undefined || !selectedAccount || !isPresent) return
    validateAddressOrNS(recipient.addressInput, selectedAccount.blockchain)
  }, [recipient.addressInput, selectedAccount, validateAddressOrNS, isPresent])

  useEffect(() => {
    if (!isPresent) return
    onUpdateRecipient({ address: validatedAddress })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedAddress, isPresent])

  return (
    <motion.div
      initial={removable ? { scale: 0, opacity: 0 } : undefined}
      animate={removable ? { scale: 1, opacity: 1 } : undefined}
      exit={removable ? { scale: 0, opacity: 0 } : undefined}
      layout={order > 1}
      style={{
        zIndex: !isPresent ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 900, damping: 40, opacity: { duration: 0.05 } }}
      className={StyleHelper.mergeStyles('w-full rounded bg-gray-800', {
        static: isPresent,
        absolute: !isPresent,
      })}
    >
      <div className="flex w-full flex-col items-center rounded bg-gray-700/60 px-3.5">
        <ActionStep className="px-0" title={t('title', { order })} leftIcon={<TbStepInto aria-hidden={true} />}>
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
              value={recipient.addressInput ?? ''}
              onChange={handleChangeAddress}
              compacted
              testId={`send-recipient-address-input-${order}`}
              className="w-full"
              placeholder={t('addressPlaceholder')}
              clearable={false}
              pastable
              rightElement={
                <IconButton
                  icon={<TbUsers aria-hidden={true} />}
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
                leftIcon={<TbWallet aria-hidden={true} />}
                flat
              />
            </GreyAccountSelect>
          </div>

          {isNameService && <span className="mt-1 block text-xs text-neon">{validatedAddress}</span>}
        </div>

        <Separator />

        <ActionStep
          className="px-0"
          title={t('tokenToSendLabel')}
          leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
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
          className="px-0"
          title={t('amountLabel')}
          leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
        >
          <GreyAmountInput value={recipient.amount ?? ''} onChange={handleChangeAmount} disabled={isAmountDisabled}>
            <Button
              label={t('max')}
              flat
              variant="text"
              colorSchema="neon"
              className="w-15 rounded-r bg-asphalt"
              loading={isLoadingMaxAmount}
              disabled={isAmountDisabled}
              onClick={() => onMaxAmount(recipient)}
            />
          </GreyAmountInput>
        </ActionStep>

        <div className="flex w-full justify-between pb-3 pl-8">
          <span className="text-xs italic text-gray-200">{t('fiatLabel', { currency: currency.label })}</span>
          <span className="text-xs italic text-gray-100">
            {NumberHelper.currency(
              recipient.amount && recipient.token
                ? NumberHelper.number(recipient.amount) * recipient.token.exchangeConvertedPrice
                : 0,
              currency.label,
              { maximumFractionDigits: 6 }
            )}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
