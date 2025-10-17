import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import { TUseTransactionsTransfer } from '@shared/@types/hooks'

type TProps = {
  transaction: TUseTransactionsTransfer
}

export const SellTokensDepositSuccessContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.success' })
  const { to, toAccount, hash } = transaction
  const name = toAccount?.name

  return (
    <div className="bg-asphalt mt-6 flex min-h-0 w-full flex-col rounded-sm p-3 pb-4">
      <div className="flex items-center gap-2.5 text-sm text-white">
        <TbReceipt aria-hidden className="text-blue h-6 w-6" />

        <p className="grow font-medium">{t('details')}</p>
      </div>

      <Separator className="mt-3" />

      <div className="mt-4 flex flex-col gap-3.5">
        <p className="text-blue bg-gray-300/15 px-3.5 py-1.5 text-xs">{t('section')}</p>

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('recipient')}</p>

          <div className="flex items-center gap-2">
            <p className="grow text-sm font-medium break-all text-white">{name ? `${name} (${to})` : to}</p>

            <Tooltip title={t('labels.copyAddress')}>
              <IconButton
                aria-label={t('labels.copyAddress')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
                onClick={UtilsHelper.copyToClipboard.bind(null, to!)}
              />
            </Tooltip>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('amount')}</p>

          <p className="text-sm font-medium break-all text-white">
            {transaction.amount} <span className="font-normal text-gray-100">{transaction.asset}</span>
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 px-3">
          <p className="text-xs text-gray-100 uppercase">{t('transactionHash')}</p>

          <div className="flex items-center gap-2">
            <p className="grow text-sm font-medium break-all text-white">{hash}</p>

            <Tooltip title={t('labels.copyTransactionHash')}>
              <IconButton
                aria-label={t('labels.copyTransactionHash')}
                size="sm"
                compacted
                icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
                onClick={UtilsHelper.copyToClipboard.bind(null, hash)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
