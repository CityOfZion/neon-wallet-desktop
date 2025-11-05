import React, { MouseEvent } from 'react'

import { hasNeo3NeoXBridge, TFullTransactionsItemBridgeNeo3NeoX } from '@cityofzion/blockchain-service'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'

import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSwapRecordSelector } from '@renderer/hooks/useUtilitySelector'

import MdCoffee from '@renderer/assets/images/md-coffee.svg?react'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbArrowsExchange from '@renderer/assets/images/tb-arrows-exchange.svg?react'
import TbBell from '@renderer/assets/images/tb-bell.svg?react'
import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'
import TbClock from '@renderer/assets/images/tb-clock.svg?react'
import TbCodeCircle from '@renderer/assets/images/tb-code-circle.svg?react'
import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbCube from '@renderer/assets/images/tb-cube.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbTransform from '@renderer/assets/images/tb-transform.svg?react'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TFullTransactionsItem } from '@shared/types/hooks'
import { TMigrationNeo3 } from '@shared/types/store'

import { TransactionActivityListItemHeaderDetails } from './TransactionActivityListItemHeaderDetails'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  item: TFullTransactionsItem
  migrationNeo3?: TMigrationNeo3
}

export const TransactionActivityListItemHeaderContent = ({ item, migrationNeo3 }: TProps) => {
  const {
    txId,
    txIdUrl,
    date,
    invocationCount,
    notificationCount,
    block,
    networkFeeAmount,
    systemFeeAmount,
    account,
    blockchain,
    isPending,
    type,
  } = item

  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.item' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { swapRecord } = useSwapRecordSelector(txId)
  const { modalNavigate } = useModalNavigate()

  const isBridgeNeo3NeoX = type === 'bridgeNeo3NeoX'

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

  const handleGoToBridgeNeo3NeoXDetails = () => {
    if (!isBridgeNeo3NeoX) return

    const toService = bsAggregator.blockchainServicesByName[blockchain === 'neo3' ? 'neox' : 'neo3']

    if (!hasNeo3NeoXBridge(toService)) return

    const { data } = item as TFullTransactionsItem & TFullTransactionsItemBridgeNeo3NeoX

    const tokenToReceive = [toService.neo3NeoXBridgeService.gasToken, toService.neo3NeoXBridgeService.neoToken].find(
      token => token.multichainId === data.token.multichainId
    )

    if (!tokenToReceive) return

    modalNavigate('neo3-neox-bridge-details', {
      state: {
        tokenToUse: data.token,
        tokenToReceive,
        accountToUse: account,
        addressToReceive: data.receiverAddress,
        amountToUse: data.amount,
        amountToReceive: data.amount,
        transactionHash: txId,
        confirmed: true,
      },
    })
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
    <div className="bg-asphalt flex h-full w-full items-center justify-between gap-x-2 rounded-sm px-1">
      <div className="flex items-center gap-x-2 truncate whitespace-nowrap" onClick={handleCancelBubbleEvent}>
        <TransactionActivityListItemHeaderDetails
          label={format(date, t('formatFullDateTime'))}
          data={format(date, t('formatHourMinutes'))}
          icon={<TbClock aria-hidden />}
        />

        {!!notificationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('notificationCountLabel')}
            data={notificationCount}
            icon={<TbBell aria-hidden />}
          />
        )}

        {!!invocationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('invocationCountLabel')}
            data={invocationCount}
            icon={<TbCodeCircle aria-hidden />}
          />
        )}

        {!!block && (
          <TransactionActivityListItemHeaderDetails
            label={t('blockLabel', { block })}
            data={StringHelper.truncateStringMiddle(block.toString(), 10)}
            icon={<TbCube aria-hidden />}
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
            icon={<TbCoin aria-hidden />}
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
            icon={<MdCoffee aria-hidden className="text-orange" />}
          />
        )}
      </div>

      <div className="flex items-center gap-x-2 truncate whitespace-nowrap">
        {(migrationNeo3 || swapRecord || isBridgeNeo3NeoX) && (
          <div className="flex items-center gap-x-2" onClick={handleCancelBubbleEvent}>
            {migrationNeo3 && (
              <TransactionActivityListItemHeaderDetails
                role="button"
                tabIndex={0}
                className="hover:opacity-90 focus:opacity-90 active:opacity-80"
                data={<p className="text-yellow">{tCommonGeneral('migrationNeo3')}</p>}
                icon={<TbArrowsExchange aria-hidden className="text-yellow" />}
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
                icon={<TbTransform aria-hidden className="text-blue" />}
                onKeyDown={handleKeyDownWrapper(handleGoToSwapDetails)}
                onClick={handleGoToSwapDetails}
              />
            )}

            {isBridgeNeo3NeoX && (
              <TransactionActivityListItemHeaderDetails
                role="button"
                tabIndex={0}
                className="border-neon h-6 max-h-6 min-h-6 rounded-sm border px-1.5 py-0 hover:opacity-90 focus:opacity-90 active:opacity-80"
                data={<p className="text-neon">{tCommonGeneral('bridgeNeo3NeoX')}</p>}
                icon={<TbReplace2 aria-hidden className="text-neon" />}
                onKeyDown={handleKeyDownWrapper(handleGoToBridgeNeo3NeoXDetails)}
                onClick={handleGoToBridgeNeo3NeoXDetails}
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
              icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
              onClick={handleCopyTxId}
            />
          </TransactionActivityListTooltip>
        </div>

        {!!txIdUrl && (
          <TbChevronRight aria-hidden className="text-neon -ml-1 h-4 max-h-4 min-h-4 w-4 max-w-4 min-w-4" />
        )}
      </div>
    </div>
  )
}
