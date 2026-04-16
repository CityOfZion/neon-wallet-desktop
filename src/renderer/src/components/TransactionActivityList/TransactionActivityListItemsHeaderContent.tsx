import React, { MouseEvent } from 'react'

import { BSBigNumberHelper, hasNeo3NeoXBridge } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useAccountsMapSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'
import { useSwapRecordSelector } from '@renderer/hooks/useUtilitySelector'

import MdCoffee from '@renderer/assets/images/md-coffee.svg?react'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbBell from '@renderer/assets/images/tb-bell.svg?react'
import TbCashBanknote from '@renderer/assets/images/tb-cash-banknote.svg?react'
import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'
import TbClock from '@renderer/assets/images/tb-clock.svg?react'
import TbCodeCircle from '@renderer/assets/images/tb-code-circle.svg?react'
import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbCube from '@renderer/assets/images/tb-cube.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbTransform from '@renderer/assets/images/tb-transform.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListItemsHeaderDetails } from './TransactionActivityListItemsHeaderDetails'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  transaction: TUseTransactionsTransaction
}

export const TransactionActivityListItemsHeaderContent = ({ transaction }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.items' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate } = useModalNavigate()
  const { swapRecord } = useSwapRecordSelector(transaction.txId)
  const { language } = useLanguageSelector()
  const { accountsMap } = useAccountsMapSelector()

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[transaction.blockchain]

  const bridgeData = hasNeo3NeoXBridge(service)
    ? service.neo3NeoXBridgeService.getTransactionData(transaction)
    : undefined

  const handleCancelBubbleEvent = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleGoToSwapDetails = () => {
    modalNavigate('swap-details', { state: { swapRecord: swapRecord! } })
  }

  const handleGoToBridgeNeo3NeoXDetails = () => {
    if (!bridgeData || !hasNeo3NeoXBridge(service)) return

    const toService =
      BlockchainServiceHelper.bsAggregator.blockchainServicesByName[service.name === 'neo3' ? 'neox' : 'neo3']

    const tokenToReceive = toService.neo3NeoXBridgeService.getTokenByMultichainId(
      bridgeData.neo3NeoxBridge.tokenToUse.multichainId
    )
    if (!tokenToReceive) return

    const accountToUse = transaction.relatedAddress
      ? accountsMap.get(
          SharedAccountHelper.buildAccountKey({
            address: transaction.relatedAddress,
            blockchain: transaction.blockchain,
          })
        )
      : undefined

    if (!accountToUse) return

    modalNavigate('neo3-neox-bridge-details', {
      state: {
        tokenToUse: bridgeData.neo3NeoxBridge.tokenToUse,
        tokenToReceive,
        accountToUse,
        addressToReceive: bridgeData.neo3NeoxBridge.receiverAddress,
        amountToUse: bridgeData.neo3NeoxBridge.amount,
        amountToReceive: bridgeData.neo3NeoxBridge.amount,
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
        <TransactionActivityListItemsHeaderDetails
          label={DateHelper.formatLocalized(transaction.date, { format: 'Pp', language })}
          data={DateHelper.formatLocalized(transaction.date, { format: 'p', language })}
          icon={<TbClock aria-hidden />}
        />

        {typeof transaction.notificationCount === 'number' && (
          <TransactionActivityListItemsHeaderDetails
            label={t('notificationCountLabel')}
            data={transaction.notificationCount}
            icon={<TbBell aria-hidden />}
          />
        )}

        {typeof transaction.invocationCount === 'number' && (
          <TransactionActivityListItemsHeaderDetails
            label={t('invocationCountLabel')}
            data={transaction.invocationCount}
            icon={<TbCodeCircle aria-hidden />}
          />
        )}

        {typeof transaction.block === 'number' && (
          <TransactionActivityListItemsHeaderDetails
            label={t('blockLabel', { block: transaction.block })}
            data={StringHelper.truncateStringMiddle(transaction.block.toString(), 10)}
            icon={<TbCube aria-hidden />}
          />
        )}

        {BSBigNumberHelper.fromNumber(transaction.networkFeeAmount).isGreaterThan('0') && (
          <TransactionActivityListItemsHeaderDetails
            data={
              <div className="flex items-center whitespace-nowrap">
                <TransactionActivityListTooltip
                  data={t('networkFeeAmountLabel', { networkFeeAmount: transaction.networkFeeAmount })}
                >
                  <span className="text-white">{StringHelper.truncateString(transaction.networkFeeAmount!, 12)}</span>
                </TransactionActivityListTooltip>

                {BSBigNumberHelper.fromNumber(transaction.systemFeeAmount).isGreaterThan('0') && (
                  <TransactionActivityListTooltip
                    data={t('systemFeeAmountLabel', { systemFeeAmount: transaction.systemFeeAmount })}
                  >
                    <span className="whitespace-break-spaces text-gray-100">{` | ${StringHelper.truncateString(transaction.systemFeeAmount!, 12)}`}</span>
                  </TransactionActivityListTooltip>
                )}
              </div>
            }
            icon={<TbCoin aria-hidden />}
          />
        )}

        {transaction.view === 'utxo' && (
          <TransactionActivityListItemsHeaderDetails
            label={t('totalAmountLabel', { totalAmount: transaction.totalAmount })}
            data={StringHelper.truncateString(transaction.totalAmount, 12)}
            icon={<TbCashBanknote aria-hidden />}
          />
        )}

        {transaction.isPending && (
          <TransactionActivityListItemsHeaderDetails
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
        {(swapRecord || bridgeData) && (
          <div className="flex items-center gap-x-2" onClick={handleCancelBubbleEvent}>
            {swapRecord && (
              <TransactionActivityListItemsHeaderDetails
                role="button"
                tabIndex={0}
                className="hover:opacity-90 focus:opacity-90 active:opacity-80"
                data={<p className="text-blue">{tCommonGeneral('swap')}</p>}
                icon={<TbTransform aria-hidden className="text-blue" />}
                onKeyDown={handleKeyDownWrapper(handleGoToSwapDetails)}
                onClick={handleGoToSwapDetails}
              />
            )}

            {bridgeData && (
              <TransactionActivityListItemsHeaderDetails
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
