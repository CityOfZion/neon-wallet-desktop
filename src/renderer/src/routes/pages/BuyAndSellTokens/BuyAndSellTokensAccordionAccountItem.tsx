import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Tooltip } from '@renderer/components/Tooltip'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useBalance } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  account: IAccountState
}

export const BuyAndSellTokensAccordionAccountItem = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyAndSellTokensAccordionAccounts' })
  const { currency } = useCurrencySelector()
  const { data, isLoading } = useBalance(account)

  const { address } = account
  const total = NumberHelper.currency(data?.exchangeTotal ?? 0, currency.label)

  return (
    <section className="flex gap-x-3 items-center px-4 py-3">
      <BlockchainIcon className="w-4 h-4 min-w-4 min-h-4 self-start mt-1" blockchain={account.blockchain} type="gray" />

      <div className="flex flex-col flex-grow gap-0.5">
        <h5 className="text-xs max-w-[164px] font-medium text-white truncate">{account.name}</h5>

        <div className="flex items-center gap-1">
          <p className="text-gray-300 text-xs">{StringHelper.truncateStringMiddle(address, 16)}</p>

          <Tooltip title={t('labels.copyAddress')}>
            <IconButton
              aria-label={t('labels.copyAddress')}
              size="xs"
              compacted
              icon={<MdOutlineContentCopy aria-hidden={true} className="text-neon" />}
              onClick={UtilsHelper.copyToClipboard.bind(null, address)}
            />
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <Loader className="text-white w-4 h-4" containerClassName="w-fit" />
      ) : (
        <Tooltip title={total}>
          <p className="text-white truncate whitespace-nowrap text-xs">{total}</p>
        </Tooltip>
      )}
    </section>
  )
}
