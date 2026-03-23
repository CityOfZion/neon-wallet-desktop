import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseTransactionsTransactionUtxo, TUseTransactionsTransactionUtxoInputOutput } from '@shared/types/hooks'

import { TransactionActivityListItemsColumn } from './TransactionActivityListItemsColumn'
import { TransactionActivityListItemsColumnDataAddress } from './TransactionActivityListItemsColumnDataAddress'
import { TransactionActivityListItemsColumnNftImage } from './TransactionActivityListItemsColumnNftImage'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TInputOutputListItemProps = {
  input?: TUseTransactionsTransactionUtxoInputOutput
  output?: TUseTransactionsTransactionUtxoInputOutput
  blockchain: TBlockchainServiceKey
  index: number
  contentClassName?: string
}

type TProps = {
  transaction: TUseTransactionsTransactionUtxo
}

const InputOutputListItem = ({ input, output, blockchain, index, contentClassName }: TInputOutputListItemProps) => {
  const hasInput = !!input

  if (!hasInput && !output) throw new Error('Should receive input or output')

  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.items' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { currency } = useCurrencySelector()
  const { address, addressUrl, account, amount, token } = (hasInput ? input : output)!
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  const exchange = useExchange(service ? [{ blockchain, tokens: [token] }] : [])

  const tokenConvertedPrice =
    exchange && service ? ExchangeHelper.getExchangeConvertedPrice(token.hash, blockchain, exchange.data) : 0

  const amountFiat = CurrencyHelper.format(
    BSBigNumberHelper.fromNumber(amount).multipliedBy(tokenConvertedPrice).toFixed(),
    { currency }
  )

  const amountSymbol = `${amount} ${token.symbol}`

  return (
    <li className="relative flex h-14 max-h-14 min-h-14 w-full items-center">
      {!hasInput && (
        <Separator type="vertical" className="bg-gray-600" containerClassName="relative -left-[0.5px] py-1" />
      )}

      <div className={StyleHelper.mergeStyles('flex grow flex-col justify-center truncate', contentClassName)}>
        <div className="flex items-end gap-x-1">
          <TransactionActivityListItemsColumn
            label={index === 0 ? t(`columns.${hasInput ? 'fromLabel' : 'toLabel'}`) : undefined}
            data={
              !address ? (
                tCommonGeneral('emptyColumn')
              ) : (
                <TransactionActivityListItemsColumnDataAddress
                  address={address}
                  accountName={account?.name}
                  addressMaxLength={36}
                  accountNameMaxLength={38}
                  className="leading-4.25"
                />
              )
            }
            url={addressUrl}
            className="w-fit max-w-fit min-w-fit"
            labelClassName="leading-4.25"
          />

          {address && (
            <TransactionActivityListTooltip data={t('copyAddressButtonLabel')}>
              <IconButton
                aria-label={t('copyAddressButtonLabel')}
                size="xs"
                compacted
                className="-mb-0.5"
                clickableProps={{ className: 'p-0.5' }}
                icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
                onClick={ClipboardHelper.write.bind(null, address)}
              />
            </TransactionActivityListTooltip>
          )}
        </div>

        <TransactionActivityListItemsColumn
          data={
            <TransactionActivityListTooltip data={`${amountSymbol} | ${amountFiat}`}>
              <span className="inline-block truncate leading-4.25">
                {amountSymbol} <span className="text-gray-300">| {amountFiat}</span>
              </span>
            </TransactionActivityListTooltip>
          }
          className="w-full max-w-full min-w-full"
        />
      </div>

      {hasInput && (
        <Separator type="vertical" className="bg-gray-600" containerClassName="relative -right-[0.5px] py-1" />
      )}
    </li>
  )
}

export const TransactionActivityListItemsUtxo = ({ transaction: { blockchain, inputs, outputs, nfts } }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.items' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })

  return (
    <div className="flex w-full flex-col">
      <div className="ml-20 grid h-fit grow grid-cols-2 pr-2 pl-4">
        {inputs.length > 0 && (
          <ul className="col-start-1 col-end-1 flex flex-col">
            {inputs.map((input: TUseTransactionsTransactionUtxoInputOutput, index) => (
              <InputOutputListItem
                key={`${input.address}-${input.amount}-${blockchain}-${index}`}
                input={input}
                blockchain={blockchain}
                index={index}
                contentClassName="pr-2"
              />
            ))}
          </ul>
        )}

        {outputs.length > 0 && (
          <ul className="col-start-2 col-end-2 flex flex-col">
            {outputs.map((output: TUseTransactionsTransactionUtxoInputOutput, index) => (
              <InputOutputListItem
                key={`${output.address}-${output.amount}-${blockchain}-${index}`}
                output={output}
                blockchain={blockchain}
                index={index}
                contentClassName="pl-2"
              />
            ))}
          </ul>
        )}
      </div>

      {nfts.length > 0 && (
        <ul className="flex w-full flex-col">
          {nfts.map(nft => {
            const { hash, name, explorerUri, collection } = nft

            return (
              <li key={hash} className="flex h-14 max-h-14 min-h-14 w-full items-center">
                <div className="flex w-20 max-w-20 min-w-20 items-center justify-center">
                  <div className="text-blue mx-auto rounded-full border border-gray-600 px-4.5 py-1.25 font-medium">
                    {t('nftLabel')}
                  </div>
                </div>

                <div className="ml-2 flex h-full max-h-full min-h-full w-full flex-col justify-center">
                  <div className="flex h-13.75 max-h-13.75 min-h-13.75 grow items-center justify-between gap-x-2 bg-gray-700/60 pr-2 pl-2">
                    <TransactionActivityListItemsColumn
                      label={t('columns.tokenHashLabel')}
                      data={
                        <TransactionActivityListTooltip data={hash}>
                          <span className="inline-block">{StringHelper.truncateStringMiddle(hash, 8)}</span>
                        </TransactionActivityListTooltip>
                      }
                      url={explorerUri}
                    />

                    <TransactionActivityListItemsColumn label={t('columns.nameLabel')} data={name} url={explorerUri} />

                    <TransactionActivityListItemsColumn
                      label={t('columns.collectionNameLabel')}
                      data={collection?.name || tCommonGeneral('emptyColumn')}
                      url={collection?.url}
                    />

                    <TransactionActivityListItemsColumnNftImage nft={nft} className="ml-0 grow-0 justify-center" />
                  </div>

                  <Separator className="h-px max-h-px min-h-px bg-gray-600" />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
