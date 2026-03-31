import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Tooltip } from '@renderer/components/Tooltip'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useBalance } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  account: IAccountState
}

export const BuyAndSellTokensAccordionAccountItem = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { currency } = useCurrencySelector()
  const { data, isLoading } = useBalance(account)

  const { address } = account
  const total = CurrencyHelper.format(data?.exchangeTotal ?? 0, { currency })

  return (
    <section className="flex items-center gap-x-3 px-4 py-3">
      <BlockchainIcon className="min-size-4 mt-1 size-4 self-start text-gray-100" blockchain={account.blockchain} />

      <div className="flex grow flex-col gap-0.5">
        <h5 className="max-w-41 truncate text-xs font-medium text-white">{account.name}</h5>

        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-300">{StringHelper.truncateStringMiddle(address, 16)}</p>

          <Tooltip title={t('copyAddressButtonLabel')}>
            <IconButton
              aria-label={t('copyAddressButtonLabel')}
              size="xs"
              compacted
              icon={<MdOutlineContentCopy aria-hidden className="text-neon" />}
              onClick={ClipboardHelper.write.bind(null, address)}
            />
          </Tooltip>
        </div>
      </div>

      {isLoading ? (
        <Loader className="h-4 w-4 text-white" containerClassName="w-fit" />
      ) : (
        <Tooltip title={total}>
          <p className="truncate text-xs whitespace-nowrap text-white">{total}</p>
        </Tooltip>
      )}
    </section>
  )
}
