import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbEye, TbReceipt } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'

import { SendSuccessModalContentItem } from './SendSuccessModalContentItem'

type TProps = {
  transactions: (TUseTransactionsTransfer | undefined)[]
  selectedAccount: IAccountState
}

export const SendSuccessModalContent = ({ transactions, selectedAccount }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()

  return (
    <div className="flex min-h-0 w-full flex-grow flex-col items-center justify-between gap-8">
      <div className="fle-grow mt-6 flex min-h-0 flex-col rounded bg-asphalt py-1.5">
        <div className="flex min-h-0 w-full flex-grow flex-col overflow-auto px-4 py-1.5">
          <div className="flex items-center gap-2.5 text-sm text-white">
            <TbReceipt aria-hidden={true} className="h-6 w-6 text-blue" />
            <span>{t('detailsTitle')}</span>
          </div>

          <Separator className="mt-2.5" />

          <ul className="mt-5 flex flex-col gap-3.5">
            {transactions.map((transaction, index) => (
              <Fragment key={`send-success-transaction-${index}`}>
                {transaction && <SendSuccessModalContentItem transaction={transaction} order={index + 1} />}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>

      <Button
        className="w-full max-w-[15.625rem]"
        label={t('viewStatusButtonLabel')}
        rightIcon={<TbEye />}
        iconsOnEdge={false}
        onClick={() => {
          modalNavigate(-1)
          navigate(`/app/wallets/${selectedAccount.id}/transactions`)
        }}
      />
    </div>
  )
}
