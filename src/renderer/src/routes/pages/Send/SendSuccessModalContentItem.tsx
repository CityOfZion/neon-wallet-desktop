import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'

import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbUsers from '@renderer/assets/images/tb-users.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TUseTransactionsTransaction, TUseTransactionsTransactionEvent } from '@shared/types/hooks'

type TProps = {
  event: TUseTransactionsTransactionEvent
  transaction: TUseTransactionsTransaction
  order: number
}

export const SendSuccessModalContentItem = ({ order, event, transaction }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const { contacts } = useContactsSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const contact = contacts.find(contact =>
    contact.addresses.some(
      SharedAccountHelper.predicate({ address: event.to!, blockchain: transaction.account.blockchain })
    )
  )

  return (
    <Details.Panel label={t('transferNumber', { order })}>
      <Details.Item label={t('recipientLabel')} contentClassName="flex-col items-start">
        <span className="text-sm break-all text-white">{contact?.name ?? event.toAccount?.name ?? event.to}</span>
        {!contact && !event.toAccount && (
          <Button
            label={t('saveContactButtonLabel')}
            className="-ml-2 w-min"
            variant="text"
            flat
            leftIcon={<TbUsers aria-hidden />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('persist-contact', {
              state: { addresses: [{ address: event.to!, blockchain: transaction.account.blockchain }] },
            })}
          />
        )}
      </Details.Item>

      {event.eventType === 'token' && (
        <Details.Item label={t('amountLabel')}>
          <span className="text-sm break-all text-white">
            {event.amount} <span className="text-gray-100">{event.token?.name}</span>
          </span>
        </Details.Item>
      )}
    </Details.Panel>
  )
}
