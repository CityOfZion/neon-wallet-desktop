import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TbUsers } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'

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
      AccountHelper.predicate({ address: transaction.to, blockchain: transaction.account.blockchain })
    )
  )

  return (
    <li>
      <div className="text-blue text-xs py-1.5 px-3.5 bg-gray-300/15">{t('transactionNumber', { order })}</div>

      <div className="flex flex-col gap-2.5 py-4 px-3">
        <span className="text-xs text-gray-100 uppercase">{t('recipientLabel')}</span>

        <div className="flex gap-6 w-full">
          <span className="text-sm text-white break-all flex-grow">
            {contact?.name ?? transaction.toAccount?.name ?? transaction.to}
          </span>

          {!contact && !transaction.toAccount && (
            <IconButton
              icon={<MdOutlineContentCopy className="text-neon" />}
              size="md"
              onClick={() => UtilsHelper.copyToClipboard(transaction.hash)}
              compacted
            />
          )}
        </div>

        {!contact && (
          <Button
            label={t('saveContactButtonLabel')}
            className="w-min -ml-2"
            variant="text"
            flat
            leftIcon={<TbUsers />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('persist-contact', {
              state: {
                addresses: [{ address: transaction.to, blockchain: transaction.account.blockchain }],
              },
            })}
          />
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-2.5 py-4 px-3">
        <span className="text-xs text-gray-100 uppercase">{t('amountLabel')}</span>

        <span className="text-sm text-white break-all">
          {transaction.amount} <span className="text-gray-100">{transaction.asset}</span>
        </span>
      </div>

      <Separator />

      <div className="flex flex-col gap-2.5 py-4 px-3">
        <span className="text-xs text-gray-100 uppercase">{t('transactionHashLabel')}</span>

        <div className="flex gap-6">
          <span className="text-sm text-white break-all">{transaction.hash}</span>
          <IconButton
            icon={<MdOutlineContentCopy className="text-neon" />}
            size="md"
            onClick={() => UtilsHelper.copyToClipboard(transaction.hash)}
            compacted
          />
        </div>
      </div>
    </li>
  )
}
