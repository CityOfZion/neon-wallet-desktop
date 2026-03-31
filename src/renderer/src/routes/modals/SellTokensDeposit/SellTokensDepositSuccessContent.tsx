import type { TBSToken } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Details } from '@renderer/components/Details'

import { useAccountsMapSelector } from '@renderer/hooks/useAccountSelector'

import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'
import type { IAccountState } from '@shared/types/store'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const SellTokensDepositSuccessContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.success' })
  const { accountsMapRef } = useAccountsMapSelector()

  let token: TBSToken | undefined
  let amount: string | undefined
  let receiverAddress: string | undefined
  let receiverAccount: IAccountState | undefined

  if (transaction.view === 'utxo') {
    const output = transaction.outputs[0]
    token = output.token
    amount = output.amount
    receiverAddress = output.address
    receiverAccount = output.address
      ? accountsMapRef.current.get(
          SharedAccountHelper.buildAccountKey({ address: output.address, blockchain: transaction.blockchain })
        )
      : undefined
  } else {
    const event = transaction.events[0]
    token = event?.eventType === 'token' ? event.token : undefined
    amount = event?.amount
    receiverAddress = event.to
    receiverAccount = event.to
      ? accountsMapRef.current.get(
          SharedAccountHelper.buildAccountKey({ address: event.to, blockchain: transaction.blockchain })
        )
      : undefined
  }

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
              {receiverAccount?.name ? `${receiverAccount.name} (${receiverAccount.address})` : receiverAddress}
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
