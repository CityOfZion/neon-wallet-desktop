import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import type { TUseTransactionsTransaction } from '@shared/types/hooks'

import { TransactionActivityListEventColumn } from './TransactionActivityListEventColumn'
import { TransactionActivityListEventColumnDataAddress } from './TransactionActivityListEventColumnDataAddress'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  event: TUseTransactionsTransaction['events'][number]
}

export const TransactionActivityListEvent = ({ event }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.event' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })

  const { eventType, amount, methodName, to, toUrl, toAccount, from, fromUrl, fromAccount } = event

  const isNft = eventType === 'nft'

  const hash = isNft ? event.collectionHash : event.contractHash
  const hashUrl = isNft ? event.collectionHashUrl : event.contractHashUrl

  const toName = toAccount?.name
  const fromName = fromAccount?.name

  return (
    <div className="ml-20 flex h-13 max-h-13 min-h-13 grow items-center gap-x-2 overflow-x-auto overflow-y-hidden pr-2 pl-4 whitespace-nowrap">
      {hash && TokenHelper.isValidTokenHash(hash) && (
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

      {match(event)
        .with({ eventType: 'nft' }, matchEvent => {
          const nftImageLabel = matchEvent.name
            ? t('nftImageAltWithNameLabel', { name: matchEvent.name })
            : t('nftImageAltLabel')

          return (
            <Fragment>
              {!!matchEvent.tokenHash && (
                <TransactionActivityListEventColumn label={t('columns.tokenHashLabel')} data={matchEvent.tokenHash} />
              )}

              {!!matchEvent.collectionName && (
                <TransactionActivityListEventColumn
                  label={t('columns.collectionNameLabel')}
                  data={matchEvent.collectionName}
                />
              )}

              {!!matchEvent.name && (
                <TransactionActivityListEventColumn
                  label={t('columns.nameLabel')}
                  data={matchEvent.name}
                  url={matchEvent.nftUrl}
                />
              )}

              {!!matchEvent.nftImageUrl && (
                <TransactionActivityListEventColumn
                  className="mt-0.5 mr-0 mb-0 ml-auto flex grow items-end justify-center"
                  data={
                    <TransactionActivityListTooltip data={nftImageLabel}>
                      <div>
                        <img
                          className="pointer-events-none max-h-8 w-full max-w-16 rounded-sm select-none"
                          src={matchEvent.nftImageUrl}
                          alt={nftImageLabel}
                        />
                      </div>
                    </TransactionActivityListTooltip>
                  }
                  url={matchEvent.nftUrl}
                />
              )}
            </Fragment>
          )
        })
        .otherwise(matchEvent => {
          const tokenSymbol = matchEvent.token?.symbol ?? ''
          const tokenName = matchEvent.token?.name ?? ''
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
