import { Fragment } from 'react'

import { TNftResponse } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { TUseTransactionsTransactionEvent } from '@shared/types/hooks'

import { TransactionActivityListEventColumn } from './TransactionActivityListEventColumn'
import { TransactionActivityListEventColumnDataAddress } from './TransactionActivityListEventColumnDataAddress'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  event: TUseTransactionsTransactionEvent
}

export const TransactionActivityListEvent = ({ event }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.event' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })

  const { eventType, amount, methodName, from, fromUrl, fromAccount, to, toUrl, toAccount } = event

  const isNft = eventType === 'nft'
  const nft = isNft ? (event.nft as TNftResponse) : undefined

  const hash = isNft ? nft?.collection?.hash : event.token?.hash
  const hashUrl = isNft ? nft?.collection?.url : event.tokenUrl
  const isValidHash = TokenHelper.isValidTokenHash(hash)

  const fromName = fromAccount?.name
  const toName = toAccount?.name

  const tokenSymbol = isNft ? '' : event.token?.symbol
  const tokenName = isNft ? '' : event.token?.name
  const hasTokenLabel = !!tokenSymbol || !!tokenName

  const nftName = isNft ? nft?.name : ''
  const nftImageLabel = nftName ? t('nftImageAltWithNameLabel', { name: nftName }) : t('nftImageAltLabel')

  return (
    <div className="ml-20 flex h-13 max-h-13 min-h-13 grow items-center gap-x-2 overflow-x-auto overflow-y-hidden pr-2 pl-4 whitespace-nowrap">
      <TransactionActivityListEventColumn
        label={t('columns.hashLabel')}
        url={hashUrl}
        data={
          !isValidHash ? (
            <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
          ) : (
            <TransactionActivityListTooltip data={hash}>
              <span className="inline-block">{StringHelper.truncateStringMiddle(hash, 8)}</span>
            </TransactionActivityListTooltip>
          )
        }
      />

      <TransactionActivityListEventColumn
        label={t('columns.methodNameLabel')}
        data={
          !methodName ? (
            <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
          ) : (
            <TransactionActivityListTooltip data={methodName} className="uppercase">
              <span className="inline-block truncate uppercase">{methodName}</span>
            </TransactionActivityListTooltip>
          )
        }
      />

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

      {!isNft ? (
        <TransactionActivityListEventColumn
          label={t('columns.tokenLabel')}
          data={
            !hasTokenLabel ? (
              <span className="inline-block">{tCommonGeneral('emptyColumn')}</span>
            ) : (
              <TransactionActivityListTooltip data={(tokenName || tokenSymbol)!}>
                <span className="inline-block truncate">{tokenSymbol || tokenName}</span>
              </TransactionActivityListTooltip>
            )
          }
        />
      ) : (
        <Fragment>
          {!!nft?.hash && (
            <TransactionActivityListEventColumn
              label={t('columns.tokenHashLabel')}
              data={
                <TransactionActivityListTooltip data={nft.hash}>
                  <span className="inline-block">{StringHelper.truncateStringMiddle(nft.hash, 8)}</span>
                </TransactionActivityListTooltip>
              }
              url={nft?.explorerUri}
            />
          )}

          {!!nftName && (
            <TransactionActivityListEventColumn label={t('columns.nameLabel')} data={nftName} url={nft?.explorerUri} />
          )}

          {!!nft?.collection?.name && (
            <TransactionActivityListEventColumn
              label={t('columns.collectionNameLabel')}
              data={nft.collection.name}
              url={nft.collection.url}
            />
          )}

          {!!nft?.image && (
            <TransactionActivityListEventColumn
              className="mt-0.5 mr-0 mb-0 ml-auto flex grow items-end justify-center"
              data={
                <TransactionActivityListTooltip data={nftImageLabel}>
                  <div>
                    <img
                      className="pointer-events-none max-h-8 w-full max-w-16 rounded-sm select-none"
                      src={nft.image}
                      alt={nftImageLabel}
                    />
                  </div>
                </TransactionActivityListTooltip>
              }
              url={nft.explorerUri}
            />
          )}
        </Fragment>
      )}
    </div>
  )
}
