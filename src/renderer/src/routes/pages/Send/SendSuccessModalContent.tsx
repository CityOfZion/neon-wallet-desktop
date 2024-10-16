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
    <div className="flex flex-col w-full items-center flex-grow min-h-0 justify-between gap-8">
      <div className="flex flex-col fle-grow  min-h-0  py-1.5 bg-asphalt mt-6 rounded">
        <div className="flex flex-col flex-grow w-full min-h-0 px-4 py-1.5 overflow-auto">
          <div className="flex text-sm text-white items-center  gap-2.5">
            <TbReceipt className="text-blue w-6 h-6" />
            <span>{t('detailsTitle')}</span>
          </div>

          <Separator className="mt-2.5" />

          <ul className="flex flex-col mt-5 gap-3.5">
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
