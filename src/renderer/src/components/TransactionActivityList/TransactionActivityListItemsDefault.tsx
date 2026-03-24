import { Fragment } from 'react'

import { TNftResponse } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { TUseTransactionsTransactionDefault, TUseTransactionsTransactionDefaultEvent } from '@shared/types/hooks'

import { TransactionActivityListItemsColumn } from './TransactionActivityListItemsColumn'
import { TransactionActivityListItemsColumnDataAddress } from './TransactionActivityListItemsColumnDataAddress'
import { TransactionActivityListItemsColumnNftImage } from './TransactionActivityListItemsColumnNftImage'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  transaction: TUseTransactionsTransactionDefault
}

export const TransactionActivityListItemsDefault = ({ transaction }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.items' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })

  return (
    <ul className="flex w-full flex-col">
      {transaction.events.map((event: TUseTransactionsTransactionDefaultEvent, index) => {
        const { eventType, amount, methodName, from, fromUrl, fromAccount, to, toUrl, toAccount } = event

        const isNft = eventType === 'nft'
        const nft = isNft ? (event.nft as TNftResponse) : undefined
        const nftName = nft?.name

        const hash = isNft ? nft?.collection?.hash : event.token?.hash
        const hashUrl = isNft ? nft?.collection?.url : event.tokenUrl
        const isValidHash = TokenHelper.isValidTokenHash(hash)

        const fromName = fromAccount?.name
        const toName = toAccount?.name

        const tokenSymbol = isNft ? '' : event.token?.symbol
        const tokenName = isNft ? '' : event.token?.name
        const hasTokenLabel = !!tokenSymbol || !!tokenName

        return (
          <li
            key={`${event.eventType}-${hash}-${event.methodName}-${transaction.blockchain}-${index}`}
            className="group/item flex h-14 max-h-14 min-h-14 w-full flex-col justify-center"
          >
            <div className="ml-20 flex h-13.75 max-h-13.75 min-h-13.75 grow items-center gap-x-2 overflow-x-auto overflow-y-hidden pr-2 pl-4 whitespace-nowrap">
              <TransactionActivityListItemsColumn
                label={t('columns.hashLabel')}
                url={hashUrl}
                data={
                  !isValidHash ? (
                    tCommonGeneral('emptyColumn')
                  ) : (
                    <TransactionActivityListTooltip data={hash}>
                      <span className="inline-block">{StringHelper.truncateStringMiddle(hash, 8)}</span>
                    </TransactionActivityListTooltip>
                  )
                }
              />

              <TransactionActivityListItemsColumn
                label={t('columns.methodNameLabel')}
                data={
                  !methodName ? (
                    tCommonGeneral('emptyColumn')
                  ) : (
                    <TransactionActivityListTooltip data={methodName} className="uppercase">
                      <span className="inline-block truncate uppercase">{methodName}</span>
                    </TransactionActivityListTooltip>
                  )
                }
              />

              <TransactionActivityListItemsColumn
                label={t('columns.fromLabel')}
                data={
                  !from ? (
                    tCommonGeneral('emptyColumn')
                  ) : (
                    <TransactionActivityListItemsColumnDataAddress address={from} accountName={fromName} />
                  )
                }
                url={fromUrl}
              />

              <TransactionActivityListItemsColumn
                label={t('columns.toLabel')}
                data={
                  !to ? (
                    tCommonGeneral('emptyColumn')
                  ) : (
                    <TransactionActivityListItemsColumnDataAddress address={to} accountName={toName} />
                  )
                }
                url={toUrl}
              />

              <TransactionActivityListItemsColumn
                label={t('columns.amountLabel')}
                data={!amount ? tCommonGeneral('emptyColumn') : amount}
              />

              {isNft ? (
                <Fragment>
                  {nft?.hash && (
                    <TransactionActivityListItemsColumn
                      label={t('columns.tokenHashLabel')}
                      data={
                        <TransactionActivityListTooltip data={nft.hash}>
                          <span className="inline-block">{StringHelper.truncateStringMiddle(nft.hash, 8)}</span>
                        </TransactionActivityListTooltip>
                      }
                      url={nft.explorerUri}
                    />
                  )}

                  {nftName && (
                    <TransactionActivityListItemsColumn
                      label={t('columns.nameLabel')}
                      data={nftName}
                      url={nft.explorerUri}
                    />
                  )}

                  {nft?.collection?.name && (
                    <TransactionActivityListItemsColumn
                      label={t('columns.collectionNameLabel')}
                      data={nft.collection.name}
                      url={nft.collection.url}
                    />
                  )}

                  <TransactionActivityListItemsColumnNftImage nft={nft!} />
                </Fragment>
              ) : (
                <TransactionActivityListItemsColumn
                  label={t('columns.tokenLabel')}
                  data={
                    !hasTokenLabel ? (
                      tCommonGeneral('emptyColumn')
                    ) : (
                      <TransactionActivityListTooltip data={(tokenName || tokenSymbol)!}>
                        <span className="inline-block truncate">{tokenSymbol || tokenName}</span>
                      </TransactionActivityListTooltip>
                    )
                  }
                />
              )}
            </div>

            <Separator className="h-px max-h-px min-h-px" containerClassName="group-last/item:hidden" />
          </li>
        )
      })}
    </ul>
  )
}
