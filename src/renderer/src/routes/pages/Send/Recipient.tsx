import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepInto, TbUsers } from 'react-icons/tb'
import { TokenBalance } from '@renderer/@types/query'
import { TContactAddress } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TRecipientParams = {
  selectedToken?: TokenBalance
  selectedRecipient?: string
  selectedRecipientDomainAddress?: string
  selectedAmount?: string
  onSelectRecipient: (recipientAddress: string) => Promise<void> | void
  active?: boolean
  loading?: boolean
  error?: boolean
}

export const Recipient = ({
  selectedToken,
  selectedAmount,
  onSelectRecipient,
  selectedRecipient,
  active,
  selectedRecipientDomainAddress,
  loading,
  error,
}: TRecipientParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { modalNavigateWrapper } = useModalNavigate()

  const handleSelectContact = (address: TContactAddress) => {
    onSelectRecipient(address.address)
  }

  const handleChangeRecipient = (event: ChangeEvent<HTMLInputElement>) => {
    onSelectRecipient(event.target.value)
  }

  return (
    <div className="flex flex-col items-center bg-gray-700/60 rounded px-3 w-full mt-2">
      <div className="flex justify-between my-1 w-full">
        <div className="flex items-center gap-3">
          <TbStepInto className="text-blue w-5 h-5 " />
          <span>{t('recipientAddress')}</span>
        </div>

        <Button
          className="flex items-center"
          onClick={modalNavigateWrapper('select-contact', {
            state: {
              handleSelectContact: handleSelectContact,
              selectedToken: selectedToken,
            },
          })}
          colorSchema={active ? 'neon' : 'white'}
          disabled={!selectedAmount}
          variant="text"
          label={t('contacts')}
          leftIcon={<TbUsers />}
          flat
        />
      </div>

      <Separator />

      <div className="py-4 flex flex-col items-center gap-1">
        {selectedRecipientDomainAddress && (
          <p className="text-neon text-left w-full text-xs">{selectedRecipientDomainAddress}</p>
        )}

        <Input
          value={selectedRecipient ?? ''}
          onChange={handleChangeRecipient}
          compacted
          disabled={!selectedAmount}
          className="w-[24rem] "
          placeholder={t('addressInputHint')}
          clearable={true}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
