import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TFullTransactionAssetEvent, TFullTransactionEvent, TFullTransactionNftEvent } from '@shared/@types/hooks'
import { match } from 'ts-pattern'

import { TransactionActivityListEventColumn } from './TransactionActivityListEventColumn'
import { TransactionActivityListEventColumnDataAddress } from './TransactionActivityListEventColumnDataAddress'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  event: TFullTransactionEvent
}

export const TransactionActivityListEvent = ({ event }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.event' })

  const { eventType, amount, methodName, to, toUrl, toAccount, from, fromUrl, fromAccount, hash, hashUrl, tokenType } =
    event

  const tokenTypeLabel = !!tokenType && tokenType !== 'generic' ? `(${tokenType.toUpperCase()})` : ''
  const methodNameLabel = `${methodName} ${tokenTypeLabel}`.trim()
  const toName = toAccount?.name
  const fromName = fromAccount?.name

  return (
    <div className="flex-grow flex justify-between items-center gap-x-2 ml-20 pl-4 pr-2 h-13 min-h-13 max-h-13 whitespace-nowrap overflow-x-auto overflow-y-hidden">
      {!!hash && <TransactionActivityListEventColumn label={t('columns.hashLabel')} data={hash} url={hashUrl} />}

      {!!methodNameLabel && (
        <TransactionActivityListEventColumn
          label={t('columns.methodNameLabel')}
          data={
            <TransactionActivityListTooltip data={methodNameLabel} className="uppercase">
              <span className="inline-block uppercase truncate max-w-32">{methodNameLabel}</span>
            </TransactionActivityListTooltip>
          }
        />
      )}

      {!!from && (
        <TransactionActivityListEventColumn
          label={t('columns.fromLabel')}
          data={<TransactionActivityListEventColumnDataAddress address={from} addressName={fromName} />}
          url={fromUrl}
        />
      )}

      {!!to && (
        <TransactionActivityListEventColumn
          label={t('columns.toLabel')}
          data={<TransactionActivityListEventColumnDataAddress address={to} addressName={toName} />}
          url={toUrl}
        />
      )}

      {amount && <TransactionActivityListEventColumn label={t('columns.amountLabel')} data={amount} />}

      {match(eventType)
        .with('nft', () => {
          const { tokenId, nftImageUrl, nftUrl, name, collectionName } = event as TFullTransactionNftEvent
          const nftImageLabel = name ? t('nftImageAltWithNameLabel', { name }) : t('nftImageAltLabel')

          return (
            <Fragment>
              {!!tokenId && <TransactionActivityListEventColumn label={t('columns.tokenIdLabel')} data={tokenId} />}

              {!!collectionName && (
                <TransactionActivityListEventColumn label={t('columns.collectionNameLabel')} data={collectionName} />
              )}

              {!!name && <TransactionActivityListEventColumn label={t('columns.nameLabel')} data={name} url={nftUrl} />}

              {!!nftImageUrl && (
                <TransactionActivityListEventColumn
                  data={
                    <TransactionActivityListTooltip data={nftImageLabel}>
                      <div>
                        <img
                          className="w-full max-w-16 max-h-9 select-none pointer-events-none rounded"
                          src={nftImageUrl}
                          alt={nftImageLabel}
                        />
                      </div>
                    </TransactionActivityListTooltip>
                  }
                  url={nftUrl}
                />
              )}
            </Fragment>
          )
        })
        .otherwise(() => {
          const { token } = event as TFullTransactionAssetEvent
          const tokenSymbol = token?.symbol ?? ''
          const tokenName = token?.name ?? ''

          if (!tokenSymbol && !tokenName) return null

          return (
            <TransactionActivityListEventColumn
              label={t('columns.tokenLabel')}
              data={
                <TransactionActivityListTooltip data={tokenName || tokenSymbol}>
                  <span className="inline-block truncate max-w-28">{tokenSymbol || tokenName}</span>
                </TransactionActivityListTooltip>
              }
            />
          )
        })}
    </div>
  )
}
