import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useExchange } from '@renderer/hooks/useExchange'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseTransactionsTransactionUtxoInputOutput } from '@shared/types/hooks'

import { TransactionActivityListItemsColumn } from './TransactionActivityListItemsColumn'
import { TransactionActivityListItemsColumnDataAddress } from './TransactionActivityListItemsColumnDataAddress'
import { TransactionActivityListTooltip } from './TransactionActivityListTooltip'

type TProps = {
  input?: TUseTransactionsTransactionUtxoInputOutput
  output?: TUseTransactionsTransactionUtxoInputOutput
  blockchain: TBlockchainServiceKey
  index: number
  contentClassName?: string
}

export const TransactionActivityListItemsUtxoInputOutput = ({
  input,
  output,
  blockchain,
  index,
  contentClassName,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionActivityList.items' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { currency } = useCurrencySelector()

  const hasInput = !!input
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
