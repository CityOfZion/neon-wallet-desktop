import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
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
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })

  const { eventType, amount, methodName, to, toUrl, toAccount, from, fromUrl, fromAccount, hash, hashUrl } = event

  const toName = toAccount?.name
  const fromName = fromAccount?.name

  return (
    <div className="ml-20 flex h-13 max-h-13 min-h-13 flex-grow items-center gap-x-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pl-4 pr-2">
      {UtilsHelper.isValidTokenHash(hash) && (
        <TransactionActivityListEventColumn
          label={t('columns.hashLabel')}
          url={hashUrl}
          data={
            <TransactionActivityListTooltip data={hash}>
              <span className="inline-block">{StringHelper.truncateStringMiddle(hash, 8)}</span>
            </TransactionActivityListTooltip>
          }
        />
      )}

      {!!methodName && (
        <TransactionActivityListEventColumn
          label={t('columns.methodNameLabel')}
          data={
            <TransactionActivityListTooltip data={methodName} className="uppercase">
              <span className="inline-block truncate uppercase">{methodName}</span>
            </TransactionActivityListTooltip>
          }
        />
      )}

      <TransactionActivityListEventColumn
        label={t('columns.fromLabel')}
        data={
          !from ? (
            <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
          ) : (
            <TransactionActivityListEventColumnDataAddress address={from} addressName={fromName} />
          )
        }
        url={fromUrl}
      />

      <TransactionActivityListEventColumn
        label={t('columns.toLabel')}
        data={
          !to ? (
            <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
          ) : (
            <TransactionActivityListEventColumnDataAddress address={to} addressName={toName} />
          )
        }
        url={toUrl}
      />

      <TransactionActivityListEventColumn
        label={t('columns.amountLabel')}
        data={
          !amount ? (
            <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
          ) : (
            <TransactionActivityListTooltip data={amount}>
              <span className="inline-block truncate">{amount}</span>
            </TransactionActivityListTooltip>
          )
        }
      />

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
                  className="mb-0 ml-auto mr-0 mt-0.5 flex flex-grow items-end justify-center"
                  data={
                    <TransactionActivityListTooltip data={nftImageLabel}>
                      <div>
                        <img
                          className="pointer-events-none max-h-8 w-full max-w-16 select-none rounded"
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
          const hasTokenLabel = !!tokenSymbol || !!tokenName

          return (
            <TransactionActivityListEventColumn
              label={t('columns.tokenLabel')}
              data={
                !hasTokenLabel ? (
                  <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
                ) : (
                  <TransactionActivityListTooltip data={tokenName || tokenSymbol}>
                    <span className="inline-block truncate">{tokenSymbol || tokenName}</span>
                  </TransactionActivityListTooltip>
                )
              }
            />
          )
        })}
    </div>
  )
}
