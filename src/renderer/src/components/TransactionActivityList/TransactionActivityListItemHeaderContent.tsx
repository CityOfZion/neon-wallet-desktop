import React, { MouseEvent } from 'react'

import { hasNeo3NeoXBridge } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'
import { useSwapRecordSelector } from '@renderer/hooks/useUtilitySelector'

import MdCoffee from '@renderer/assets/images/md-coffee.svg?react'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbBell from '@renderer/assets/images/tb-bell.svg?react'
import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'
import TbClock from '@renderer/assets/images/tb-clock.svg?react'
import TbCodeCircle from '@renderer/assets/images/tb-code-circle.svg?react'
import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbCube from '@renderer/assets/images/tb-cube.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbTransform from '@renderer/assets/images/tb-transform.svg?react'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListItemHeaderDetails } from './TransactionActivityListItemHeaderDetails'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const TransactionActivityListItemHeaderContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.item' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { swapRecord } = useSwapRecordSelector(transaction.txId)
  const { modalNavigate } = useModalNavigate()
  const { language } = useLanguageSelector()

  const isBridgeNeo3NeoX = transaction.type === 'bridgeNeo3NeoX'

  const handleCancelBubbleEvent = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleGoToSwapDetails = () => {
    modalNavigate('swap-details', { state: { swapRecord: swapRecord! } })
  }

  const handleGoToBridgeNeo3NeoXDetails = () => {
    if (!isBridgeNeo3NeoX) return

    const toService =
      BlockchainServiceHelper.bsAggregator.blockchainServicesByName[transaction.blockchain === 'neo3' ? 'neox' : 'neo3']

    if (!hasNeo3NeoXBridge(toService)) return

    const tokenToReceive = toService.neo3NeoXBridgeService.getTokenByMultichainId(
      transaction.data.tokenToUse.multichainId
    )
    if (!tokenToReceive) return

    modalNavigate('neo3-neox-bridge-details', {
      state: {
        tokenToUse: transaction.data.tokenToUse,
        tokenToReceive,
        accountToUse: transaction.account,
        addressToReceive: transaction.data.receiverAddress,
        amountToUse: transaction.data.amount,
        amountToReceive: transaction.data.amount,
        transactionHash: transaction.txId,
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
    ClipboardHelper.write(transaction.txId)
  }

  return (
    <div className="bg-asphalt flex h-full w-full items-center justify-between gap-x-2 rounded-sm px-1">
      <div className="flex items-center gap-x-2 truncate whitespace-nowrap" onClick={handleCancelBubbleEvent}>
        <TransactionActivityListItemHeaderDetails
          label={DateHelper.formatLocalized(transaction.date, { format: 'Pp', language })}
          data={DateHelper.formatLocalized(transaction.date, { format: 'p', language })}
          icon={<TbClock aria-hidden />}
        />

        {!!transaction.notificationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('notificationCountLabel')}
            data={transaction.notificationCount}
            icon={<TbBell aria-hidden />}
          />
        )}

        {!!transaction.invocationCount && (
          <TransactionActivityListItemHeaderDetails
            label={t('invocationCountLabel')}
            data={transaction.invocationCount}
            icon={<TbCodeCircle aria-hidden />}
          />
        )}

        {!!transaction.block && (
          <TransactionActivityListItemHeaderDetails
            label={t('blockLabel', { block: transaction.block })}
            data={StringHelper.truncateStringMiddle(transaction.block.toString(), 10)}
            icon={<TbCube aria-hidden />}
          />
        )}

        {transaction.networkFeeAmount && NumberHelper.number(transaction.networkFeeAmount) > 0 && (
          <TransactionActivityListItemHeaderDetails
            data={
              <div className="flex items-center whitespace-nowrap">
                <TransactionActivityListTooltip
                  data={t('networkFeeAmountLabel', { networkFeeAmount: transaction.networkFeeAmount })}
                >
                  <span className="text-white">{StringHelper.truncateString(transaction.networkFeeAmount, 12)}</span>
                </TransactionActivityListTooltip>

                {transaction.systemFeeAmount && NumberHelper.number(transaction.systemFeeAmount) > 0 && (
                  <TransactionActivityListTooltip
                    data={t('systemFeeAmountLabel', { systemFeeAmount: transaction.systemFeeAmount })}
                  >
                    <span className="whitespace-break-spaces text-gray-100">{` | ${StringHelper.truncateString(transaction.systemFeeAmount, 12)}`}</span>
                  </TransactionActivityListTooltip>
                )}
              </div>
            }
            icon={<TbCoin aria-hidden />}
          />
        )}

        {transaction.isPending && (
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
        {(swapRecord || isBridgeNeo3NeoX) && (
          <div className="flex items-center gap-x-2" onClick={handleCancelBubbleEvent}>
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
          <TransactionActivityListTooltip data={transaction.txId}>
            <span>
              {t('txIdLabel')}{' '}
              <span className="text-gray-100">{StringHelper.truncateStringStart(transaction.txId, 8)}</span>
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

        {!!transaction.txIdUrl && (
          <TbChevronRight aria-hidden className="text-neon -ml-1 h-4 max-h-4 min-h-4 w-4 max-w-4 min-w-4" />
        )}
      </div>
    </div>
  )
}
