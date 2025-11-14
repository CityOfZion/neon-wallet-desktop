import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TUseTransactionsTransfer } from '@shared/types/hooks'

type TProps = {
  transaction: TUseTransactionsTransfer
  order: number
}

export const SendSuccessModalContentItem = ({ order, transaction }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const { contacts } = useContactsSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const contact = contacts.find(contact =>
    contact.addresses.some(
      SharedAccountHelper.predicate({ address: transaction.to!, blockchain: transaction.account.blockchain })
    )
  )

  return (
    <li>
      <div className="text-blue bg-gray-300/15 px-3.5 py-1.5 text-xs">{t('transactionNumber', { order })}</div>

      <div className="flex flex-col gap-2.5 px-3 py-4">
        <span className="text-xs text-gray-100 uppercase">{t('recipientLabel')}</span>

        <div className="flex w-full gap-6">
          <span className="grow text-sm break-all text-white">
            {contact?.name ?? transaction.toAccount?.name ?? transaction.to}
          </span>

          {!contact && !transaction.toAccount && (
            <IconButton
              icon={<MdOutlineContentCopy className="text-neon" />}
              size="md"
              onClick={() => UtilsHelper.copyToClipboard(transaction.to!)}
              compacted
            />
          )}
        </div>

        {!contact && (
          <Button
            label={t('saveContactButtonLabel')}
            className="-ml-2 w-min"
            variant="text"
            flat
            leftIcon={<TbUsers aria-hidden />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('persist-contact', {
              state: {
                addresses: [{ address: transaction.to!, blockchain: transaction.account.blockchain }],
              },
            })}
          />
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-2.5 px-3 py-4">
        <span className="text-xs text-gray-100 uppercase">{t('amountLabel')}</span>

        <span className="text-sm break-all text-white">
          {transaction.amount} <span className="text-gray-100">{transaction.asset}</span>
        </span>
      </div>

      <Separator />

      <div className="flex flex-col gap-2.5 px-3 py-4">
        <span className="text-xs text-gray-100 uppercase">{t('transactionHashLabel')}</span>

        <div className="flex gap-6">
          <span className="text-sm break-all text-white">{transaction.hash}</span>
          <IconButton
            icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
            size="md"
            onClick={() => UtilsHelper.copyToClipboard(transaction.hash)}
            compacted
          />
        </div>
      </div>
    </li>
  )
}
