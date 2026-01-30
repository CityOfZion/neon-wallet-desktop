import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Details } from '@renderer/components/Details'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbEye from '@renderer/assets/images/tb-eye.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'
import { IAccountState } from '@shared/types/store'

import { SendSuccessModalContentItem } from './SendSuccessModalContentItem'

type TProps = {
  transactions: TUseTransactionsTransaction[]
  selectedAccount: IAccountState
}

export const SendSuccessModalContent = ({ transactions, selectedAccount }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()

  return (
    <div className="mt-6 flex min-h-0 w-full grow flex-col items-center justify-between gap-8">
      <Details.Root className="min-h-0 grow">
        <Details.Header leftElement={<TbReceipt aria-hidden />}>{t('detailsTitle')}</Details.Header>

        <Details.HeaderSeparator />

        <Details.Body>
          {transactions.map((transaction, index) => (
            <Details.Panel
              key={`send-success-transaction-${index}`}
              label={t('transactionNumber', { order: index + 1 })}
            >
              <Details.Item label={t('transactionHashLabel')} copyable={transaction?.txId}>
                {transaction?.txId}
              </Details.Item>

              {transaction.events.map((event, eventIndex) => (
                <SendSuccessModalContentItem
                  key={`send-success-event-${eventIndex}`}
                  event={event}
                  transaction={transaction}
                  order={index + 1}
                />
              ))}
            </Details.Panel>
          ))}
        </Details.Body>
      </Details.Root>

      <Button
        className="w-full max-w-62.5"
        label={t('viewStatusButtonLabel')}
        rightIcon={<TbEye />}
        iconsOnEdge={false}
        onClick={() => {
          modalNavigate(-1)
          navigate('/wallets/transactions', { state: { account: selectedAccount } })
        }}
      />
    </div>
  )
}
