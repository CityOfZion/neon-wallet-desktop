import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbEye from '@renderer/assets/images/tb-eye.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import { TUseTransactionsTransfer } from '@shared/types/hooks'
import { IAccountState } from '@shared/types/store'

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
    <div className="flex min-h-0 w-full grow flex-col items-center justify-between gap-8">
      <div className="fle-grow bg-asphalt mt-6 flex min-h-0 flex-col rounded-sm py-1.5">
        <div className="flex min-h-0 w-full grow flex-col overflow-auto px-4 py-1.5">
          <div className="flex items-center gap-2.5 text-sm text-white">
            <TbReceipt aria-hidden className="text-blue h-6 w-6" />
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
