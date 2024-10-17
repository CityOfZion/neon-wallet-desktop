import { ChangeEvent, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TbChevronRight, TbStepInto, TbStepOut, TbUsers, TbWallet } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { ActionStep } from '@renderer/components/ActionStep'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState, TContactAddress } from '@shared/@types/store'
import { motion, useIsPresent } from 'framer-motion'

export type TSendRecipient = {
  id: string
  token?: TTokenBalance
  amount?: string
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
}

export const SendRecipient = ({
  order,
  selectedAccount,
  recipient,
  onUpdateRecipient,
  onRemoveRecipient,
  removable = false,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.recipient' })
  const { t: commonT } = useTranslation('common')
  const { modalNavigateWrapper } = useModalNavigate()
  const { currency } = useCurrencySelector()
  const isPresent = useIsPresent()

  const {
    isNameService,
    validatedAddress,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
  } = useNameService()

  const handleChangeAddress = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdateRecipient({ addressInput: event.target.value })
  }

  const handleSelectContact = (address: TContactAddress) => {
    onUpdateRecipient({ addressInput: address.address })
  }

  const handleSelectToken = (token: TTokenBalance) => {
    onUpdateRecipient({ token, amount: undefined })
  }

  const handleSelectAmount = (amount: string) => {
    onUpdateRecipient({ amount })
  }

  const handleSelectAccount = (account: IAccountState) => {
    onUpdateRecipient({ addressInput: account.address })
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
      className={StyleHelper.mergeStyles('bg-gray-800  rounded w-full', {
        static: isPresent,
        absolute: !isPresent,
      })}
    >
      <div className="flex flex-col items-center bg-gray-700/60  px-3.5 w-full">
        <ActionStep
          className="px-0"
          title={t('title', { order })}
          disabled={!selectedAccount}
          leftIcon={<TbStepInto />}
        >
          {removable && (
            <Button
              label={commonT('general.remove')}
              flat
              variant="text-slim"
              textClassName="text-pink"
              onClick={() => onRemoveRecipient()}
            />
          )}
        </ActionStep>

        <Separator />

        <div className="flex flex-col w-full my-5">
          <div className="flex w-full gap-3 items-start">
            <Input
              value={recipient.addressInput ?? ''}
              onChange={handleChangeAddress}
              compacted
              testId={`send-recipient-address-input-${order}`}
              className="w-full"
              placeholder={t('addressPlaceholder')}
              clearable={false}
              buttons={
                <IconButton
                  icon={<TbUsers />}
                  colorSchema={!selectedAccount || validatedAddress ? 'white' : 'neon'}
                  type="button"
                  onClick={modalNavigateWrapper('select-contact', {
                    state: {
                      onSelectContact: handleSelectContact,
                      blockchain: selectedAccount?.blockchain,
                    },
                  })}
                  compacted
                  disabled={!selectedAccount}
                />
              }
              loading={isValidatingAddressOrDomainAddress}
              errorMessage={isValidAddressOrDomainAddress === false ? t('errors.invalidAddress') : undefined}
              disabled={!selectedAccount}
            />

            <Button
              colorSchema={!selectedAccount || validatedAddress ? 'white' : 'neon'}
              disabled={!selectedAccount}
              variant="text"
              label={t('myAccountButtonLabel')}
              leftIcon={<TbWallet />}
              flat
              onClick={modalNavigateWrapper('select-account', {
                state: {
                  onSelectAccount: handleSelectAccount,
                  title: t('myAccountsModalTitle'),
                  buttonLabel: t('myAccountsModalButtonLabel'),
                  leftIcon: <TbStepOut />,
                  blockchain: selectedAccount?.blockchain,
                },
              })}
            />
          </div>

          {isNameService && <span className="text-neon block mt-1 text-xs">{validatedAddress}</span>}
        </div>

        <Separator />

        <ActionStep
          className="px-0"
          title={t('tokenToSendLabel')}
          leftIcon={<VscCircleFilled className="text-gray-300 w-2 h-2" />}
          disabled={!selectedAccount}
        >
          <Button
            flat
            variant="text"
            className="flex items-center"
            textClassName="font-normal"
            clickableProps={{
              className: 'text-sm pl-3 pr-1',
            }}
            label={
              recipient.token
                ? StringHelper.truncateString(recipient.token.token.symbol, 8)
                : t('tokenToSendLabelButtonLabel')
            }
            onClick={modalNavigateWrapper('select-token', {
              state: {
                selectedAccount: selectedAccount,
                onSelectToken: handleSelectToken,
              },
            })}
            colorSchema={!selectedAccount || recipient.token ? 'white' : 'neon'}
            disabled={!selectedAccount}
            rightIcon={<TbChevronRight />}
          />
        </ActionStep>

        <Separator />

        <ActionStep
          className="px-0"
          title={t('amountLabel')}
          leftIcon={<VscCircleFilled className="text-gray-300 w-2 h-2" />}
          disabled={!selectedAccount || !recipient.token}
        >
          <Button
            flat
            variant="text"
            className="flex items-center"
            textClassName="font-normal"
            clickableProps={{
              className: 'text-sm pl-3 pr-1',
            }}
            label={recipient.amount ?? t('amountPlaceholder')}
            onClick={modalNavigateWrapper('input-amount', {
              state: {
                tokenBalance: recipient.token,
                onSelectAmount: handleSelectAmount,
              },
            })}
            colorSchema={!selectedAccount || !recipient.token || recipient.amount ? 'white' : 'neon'}
            disabled={!selectedAccount || !recipient.token}
            rightIcon={<TbChevronRight />}
          />
        </ActionStep>

        <div
          className={StyleHelper.mergeStyles('flex justify-between w-full px-8 pb-3', {
            'opacity-50': !recipient.amount || !recipient.token || !selectedAccount,
          })}
        >
          <span className="text-gray-200 italic text-xs">{t('fiatLabel', { currency: currency.label })}</span>
          <span className="text-gray-100 italic text-xs">
            {NumberHelper.currency(
              recipient.amount && recipient.token
                ? NumberHelper.number(recipient.amount) * recipient.token.exchangeConvertedPrice
                : 0,
              currency.label,
              undefined,
              6
            )}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
