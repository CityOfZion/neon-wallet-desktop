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
    <section className="flex items-center gap-x-3 px-4 py-3">
      <BlockchainIcon className="mt-1 h-4 min-h-4 w-4 min-w-4 self-start" blockchain={account.blockchain} type="gray" />

      <div className="flex flex-grow flex-col gap-0.5">
        <h5 className="max-w-[164px] truncate text-xs font-medium text-white">{account.name}</h5>

        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-300">{StringHelper.truncateStringMiddle(address, 16)}</p>

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
        <Loader className="h-4 w-4 text-white" containerClassName="w-fit" />
      ) : (
        <Tooltip title={total}>
          <p className="truncate whitespace-nowrap text-xs text-white">{total}</p>
        </Tooltip>
      )}
    </section>
  )
}
