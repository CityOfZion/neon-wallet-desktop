import type { TBSToken, TTransactionDefaultEvent, TTransactionUtxoInputOutput } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'

import { useAccountsMapSelector } from '@renderer/hooks/useAccountSelector'
import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbUsers from '@renderer/assets/images/tb-users.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'

type TProps = {
  item: TTransactionDefaultEvent | TTransactionUtxoInputOutput
  transaction: TUseTransactionsTransaction
  order: number
}

export const SendSuccessModalContentItem = ({ item, transaction, order }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const { contacts } = useContactsSelector()
  const { accountsMapRef } = useAccountsMapSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const { blockchain, view } = transaction
  const isUtxo = view === 'utxo'

  let address: string | undefined
  let token: TBSToken | undefined

  if (isUtxo) {
    const utxoItem = item as TTransactionUtxoInputOutput
    address = utxoItem.address
    token = utxoItem.token
  } else {
    const defaultEventItem = item as TTransactionDefaultEvent
    address = defaultEventItem.to
    token =
      defaultEventItem.eventType === 'token'
        ? (defaultEventItem as TTransactionDefaultEvent & { token: any }).token
        : undefined
  }

  const account = address
    ? accountsMapRef.current.get(SharedAccountHelper.buildAccountKey({ address, blockchain }))
    : undefined

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
