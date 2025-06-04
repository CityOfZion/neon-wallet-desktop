import React, { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MdCoffee, MdOutlineContentCopy } from 'react-icons/md'
import {
  TbArrowsExchange,
  TbBell,
  TbChevronRight,
  TbClock,
  TbCodeCircle,
  TbCoin,
  TbCube,
  TbTransform,
} from 'react-icons/tb'
import { IconButton } from '@renderer/components/IconButton'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSwapRecordSelector } from '@renderer/hooks/useUtilitySelector'
import { TFullTransactionsItem } from '@shared/@types/hooks'
import { TMigrationNeo3 } from '@shared/@types/store'
import { format } from 'date-fns'

import { TransactionActivityListItemHeaderDetails } from './TransactionActivityListItemHeaderDetails'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  item: TFullTransactionsItem
  migrationNeo3?: TMigrationNeo3
}

export const TransactionActivityListItemHeaderContent = ({
  item: {
    txId,
    txIdUrl,
    date,
    invocationCount,
    notificationCount,
    block,
    networkFeeAmount,
    systemFeeAmount,
    isPending,
  },
  migrationNeo3,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.item' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { swapRecord } = useSwapRecordSelector(txId)
  const { modalNavigate } = useModalNavigate()

  const handleCancelBubbleEvent = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleGoToMigrationNeo3Status = () => {
    modalNavigate('migration-neo3-status', { state: { hash: txId } })
  }

  const handleGoToSwapDetails = () => {
    modalNavigate('swap-details', { state: { swapRecord } })
  }

  const handleKeyDownWrapper = (callback: () => void) => {
    return ({ code }: React.KeyboardEvent<HTMLDivElement>) => {
      if (code !== 'Space' && code !== 'Enter') return

      callback()
    }
  }

  const handleCopyTxId = () => {
    UtilsHelper.copyToClipboard(txId)
  }

  return (
    <div className="flex h-full w-full items-center justify-between gap-x-2 rounded bg-asphalt px-1">
      <div className="flex items-center gap-x-2 truncate whitespace-nowrap" onClick={handleCancelBubbleEvent}>
        <TransactionActivityListItemHeaderDetails
          label={format(date, t('formatFullDateTime'))}
          data={format(date, t('formatHourMinutes'))}
          icon={<TbClock aria-hidden={true} />}
        />

        {!!notificationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('notificationCountLabel')}
            data={notificationCount}
            icon={<TbBell aria-hidden={true} />}
          />
        )}

        {!!invocationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('invocationCountLabel')}
            data={invocationCount}
            icon={<TbCodeCircle aria-hidden={true} />}
          />
        )}

        {!!block && (
          <TransactionActivityListItemHeaderDetails
            label={t('blockLabel', { block })}
            data={StringHelper.truncateStringMiddle(block.toString(), 10)}
            icon={<TbCube aria-hidden={true} />}
          />
        )}

        {networkFeeAmount && NumberHelper.isBiggerThanZero(networkFeeAmount) && (
          <TransactionActivityListItemHeaderDetails
            data={
              <div className="flex items-center whitespace-nowrap">
                <TransactionActivityListTooltip data={t('networkFeeAmountLabel', { networkFeeAmount })}>
                  <span className="text-white">{StringHelper.truncateString(networkFeeAmount, 12)}</span>
                </TransactionActivityListTooltip>

                {systemFeeAmount && NumberHelper.isBiggerThanZero(systemFeeAmount) && (
                  <TransactionActivityListTooltip data={t('systemFeeAmountLabel', { systemFeeAmount })}>
                    <span className="whitespace-break-spaces text-gray-100">{` | ${StringHelper.truncateString(systemFeeAmount, 12)}`}</span>
                  </TransactionActivityListTooltip>
                )}
              </div>
            }
            icon={<TbCoin aria-hidden={true} />}
          />
        )}

        {isPending && (
          <TransactionActivityListItemHeaderDetails
            className="animate-pulse"
            data={
              <TransactionActivityListTooltip data={t('pendingTooltipLabel')}>
                <span className="text-orange">{t('pendingDataLabel')}</span>
              </TransactionActivityListTooltip>
            }
            icon={<MdCoffee aria-hidden={true} className="text-orange" />}
          />
        )}
      </div>

      <div className="flex items-center gap-x-2 truncate whitespace-nowrap">
        {(migrationNeo3 || swapRecord) && (
          <div className="flex items-center gap-x-2" onClick={handleCancelBubbleEvent}>
            {migrationNeo3 && (
              <TransactionActivityListItemHeaderDetails
                role="button"
                tabIndex={0}
                className="hover:opacity-90 focus:opacity-90 active:opacity-80"
                data={<p className="text-yellow">{tCommonGeneral('migrationNeo3')}</p>}
                icon={<TbArrowsExchange aria-hidden={true} className="text-yellow" />}
                onKeyDown={handleKeyDownWrapper(handleGoToMigrationNeo3Status)}
                onClick={handleGoToMigrationNeo3Status}
              />
            )}

            {swapRecord && (
              <TransactionActivityListItemHeaderDetails
                role="button"
                tabIndex={0}
                className="hover:opacity-90 focus:opacity-90 active:opacity-80"
                data={<p className="text-blue">{tCommonGeneral('swap')}</p>}
                icon={<TbTransform aria-hidden={true} className="text-blue" />}
                onKeyDown={handleKeyDownWrapper(handleGoToSwapDetails)}
                onClick={handleGoToSwapDetails}
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-x-1 text-gray-300" onClick={handleCancelBubbleEvent}>
          <TransactionActivityListTooltip data={txId}>
            <span>
              {t('txIdLabel')} <span className="text-gray-100">{StringHelper.truncateStringStart(txId, 8)}</span>
            </span>
          </TransactionActivityListTooltip>

          <TransactionActivityListTooltip data={t('copyTxIdLabel')}>
            <IconButton
              aria-label={t('copyTxIdLabel')}
              size="xs"
              compacted
              icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
              onClick={handleCopyTxId}
            />
          </TransactionActivityListTooltip>
        </div>

        {!!txIdUrl && (
          <TbChevronRight aria-hidden className="-ml-1 h-4 max-h-4 min-h-4 w-4 min-w-4 max-w-4 text-neon" />
        )}
      </div>
    </div>
  )
}
