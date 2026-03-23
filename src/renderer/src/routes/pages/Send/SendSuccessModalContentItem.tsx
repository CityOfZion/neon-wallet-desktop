import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'

import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbUsers from '@renderer/assets/images/tb-users.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type {
  TUseTransactionsTransaction,
  TUseTransactionsTransactionDefaultEvent,
  TUseTransactionsTransactionDefaultEventToken,
  TUseTransactionsTransactionUtxoInputOutput,
} from '@shared/types/hooks'

type TProps = {
  item: TUseTransactionsTransactionDefaultEvent | TUseTransactionsTransactionUtxoInputOutput
  transaction: TUseTransactionsTransaction
  order: number
}

export const SendSuccessModalContentItem = ({ item, transaction, order }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const { contacts } = useContactsSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const { blockchain, view } = transaction
  const isUtxo = view === 'utxo'

  const { address, account } = match(isUtxo)
    .with(true, () => {
      const { address, account } = item as TUseTransactionsTransactionUtxoInputOutput

      return { address, account }
    })
    .otherwise(() => {
      const { to, toAccount } = item as TUseTransactionsTransactionDefaultEvent

      return { address: to, account: toAccount }
    })

  const token = match({ isUtxo, item })
    .with({ isUtxo: true }, () => (item as TUseTransactionsTransactionUtxoInputOutput).token)
    .with(
      { item: P.when(value => (value as TUseTransactionsTransactionDefaultEvent).eventType === 'token') },
      () => (item as TUseTransactionsTransactionDefaultEventToken).token
    )
    .otherwise(() => undefined)

  const contact = address
    ? contacts.find(contact => contact.addresses.some(SharedAccountHelper.predicate({ address, blockchain })))
    : undefined

  return (
    <Details.Panel label={t('transferNumber', { order })}>
      <Details.Item label={t('recipientLabel')} contentClassName="flex-col items-start">
        <span className="text-sm break-all text-white">{contact?.name || account?.name || address}</span>

        {!contact && !account && address && (
          <Button
            label={t('saveContactButtonLabel')}
            className="-ml-2 w-min"
            variant="text"
            flat
            leftIcon={<TbUsers aria-hidden />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('persist-contact', {
              state: { addresses: [{ address, blockchain }] },
            })}
          />
        )}
      </Details.Item>

      <Details.Item label={t('amountLabel')}>
        <span className="text-sm break-all text-white">
          {item.amount} {token?.symbol && <span className="text-gray-100">{token.symbol}</span>}
        </span>
      </Details.Item>
    </Details.Panel>
  )
}
