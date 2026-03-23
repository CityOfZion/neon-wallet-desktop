import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Details } from '@renderer/components/Details'

import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const SellTokensDepositSuccessContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.success' })
  const isUtxo = transaction.view === 'utxo'
  const output = isUtxo ? transaction.outputs[0] : undefined
  const event = !isUtxo ? transaction.events[0] : undefined
  const amount = isUtxo ? output!.amount : event!.amount
  const receiverAccount = isUtxo ? output?.account : event?.toAccount
  const receiverName = receiverAccount?.name
  const receiverAddress = receiverAccount?.address

  const token = match({ output, event })
    .with({ output: P.nonNullable }, ({ output }) => output.token)
    .with({ event: P.when(value => value?.eventType === 'token') }, ({ event }) => event.token)
    .otherwise(() => undefined)

  return (
    <Details.Root className="mt-6 min-h-0 pt-2">
      <Details.Header className="font-medium" leftElement={<TbReceipt aria-hidden />}>
        {t('details')}
      </Details.Header>

      <Details.HeaderSeparator className="mt-3" />

      <Details.Body className="mt-4 gap-3.5">
        <Details.Panel label={t('section')}>
          <Details.Item label={t('recipient')} className="gap-2 pr-3" copyable={receiverAddress}>
            <span className="grow text-sm font-medium break-all text-white">
              {receiverName ? `${receiverName} (${receiverAddress})` : receiverAddress}
            </span>
          </Details.Item>

          <Details.Item label={t('amount')} className="gap-2 pr-3">
            <span className="text-sm font-medium break-all text-white">
              {amount} {token && <span className="font-normal text-gray-100">{token.symbol}</span>}
            </span>
          </Details.Item>

          <Details.Item label={t('transactionHash')} className="gap-2 pr-3" copyable={transaction.txId}>
            <span className="grow text-sm font-medium break-all text-white">{transaction.txId}</span>
          </Details.Item>
        </Details.Panel>
      </Details.Body>
    </Details.Root>
  )
}
