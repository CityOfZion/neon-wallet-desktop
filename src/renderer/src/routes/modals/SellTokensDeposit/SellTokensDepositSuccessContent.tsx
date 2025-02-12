import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TbReceipt } from 'react-icons/tb'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'

type TProps = {
  transaction: TUseTransactionsTransfer
}

export const SellTokensDepositSuccessContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.success' })
  const { to, toAccount, hash } = transaction
  const name = toAccount?.name

  return (
    <div className="flex flex-col w-full min-h-0 p-3 pb-4 bg-asphalt mt-6 rounded">
      <div className="flex text-sm text-white items-center gap-2.5">
        <TbReceipt aria-hidden={true} className="text-blue w-6 h-6" />

        <p className="flex-grow font-medium">{t('details')}</p>
      </div>

      <Separator className="mt-3" />

      <div className="flex flex-col mt-4 gap-3.5">
        <p className="text-blue text-xs py-1.5 px-3.5 bg-gray-300/15">{t('section')}</p>

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('recipient')}</p>

          <div className="flex items-center gap-2">
            <p className="text-sm text-white break-all flex-grow font-medium">{name ? `${name} (${to})` : to}</p>

            <Tooltip title={t('labels.copyAddress')}>
              <IconButton
                aria-label={t('labels.copyAddress')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
                onClick={UtilsHelper.copyToClipboard.bind(null, to)}
              />
            </Tooltip>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('amount')}</p>

          <p className="text-sm text-white break-all font-medium">
            {transaction.amount} <span className="font-normal text-gray-100">{transaction.asset}</span>
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('transactionHash')}</p>

          <div className="flex items-center gap-2">
            <p className="text-sm text-white break-all flex-grow font-medium">{hash}</p>

            <Tooltip title={t('labels.copyTransactionHash')}>
              <IconButton
                aria-label={t('labels.copyTransactionHash')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
                onClick={UtilsHelper.copyToClipboard.bind(null, hash)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
