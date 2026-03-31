import { Fragment } from 'react'

import { type TBSToken, TNftResponse } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'

import { useAccountsMapSelector } from '@renderer/hooks/useAccountSelector'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TUseTransactionsTransactionDefault } from '@shared/types/hooks'

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
  const { accountsMapRef } = useAccountsMapSelector()

  const blockchain = transaction.blockchain

  return (
    <ul className="flex w-full flex-col">
      {transaction.events.map((event, index) => {
        const { eventType, amount, methodName, from, fromUrl, to, toUrl } = event

        const fromAccount = from
          ? accountsMapRef.current.get(SharedAccountHelper.buildAccountKey({ address: from, blockchain }))
          : undefined
        const toAccount = to
          ? accountsMapRef.current.get(SharedAccountHelper.buildAccountKey({ address: to, blockchain }))
          : undefined

        let token: TBSToken | undefined
        let nft: TNftResponse | undefined
        let hash: string | undefined
        let hashUrl: string | undefined

        if (eventType === 'token') {
          token = event.token
          hash = event.token?.hash
          hashUrl = event.tokenUrl
        } else if (eventType === 'nft') {
          hash = nft?.collection?.hash
          hashUrl = nft?.collection?.url
          nft = event.nft
        }

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
                  !hash ? (
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
                    <TransactionActivityListItemsColumnDataAddress address={from} accountName={fromAccount?.name} />
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
                    <TransactionActivityListItemsColumnDataAddress address={to} accountName={toAccount?.name} />
                  )
                }
                url={toUrl}
              />

              {eventType !== 'generic' && (
                <Fragment>
                  <TransactionActivityListItemsColumn
                    label={t('columns.amountLabel')}
                    data={!amount ? tCommonGeneral('emptyColumn') : amount}
                  />

                  {nft ? (
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

                      {nft?.name && (
                        <TransactionActivityListItemsColumn
                          label={t('columns.nameLabel')}
                          data={nft.name}
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
                        !token ? (
                          tCommonGeneral('emptyColumn')
                        ) : (
                          <TransactionActivityListTooltip data={(token.name || token.symbol)!}>
                            <span className="inline-block truncate">{token.symbol || token.name}</span>
                          </TransactionActivityListTooltip>
                        )
                      }
                    />
                  )}
                </Fragment>
              )}

              {eventType === 'generic' &&
                !!event.data &&
                Object.entries(event.data).map(([key, value]) => (
                  <TransactionActivityListItemsColumn
                    labelClassName="capitalize"
                    key={t(`columnsByKey.${key}`, { defaultValue: key })}
                    label={key}
                    data={!value ? tCommonGeneral('emptyColumn') : value}
                  />
                ))}
            </div>

            <Separator className="h-px max-h-px min-h-px" containerClassName="group-last/item:hidden" />
          </li>
        )
      })}
    </ul>
  )
}
