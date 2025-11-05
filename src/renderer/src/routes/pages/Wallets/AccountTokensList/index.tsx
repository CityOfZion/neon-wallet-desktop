import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { Loader } from '@renderer/components/Loader'
import { Tabs } from '@renderer/components/Tabs'
import { TokensTable } from '@renderer/components/TokensTable'

import { NumberHelper } from '@renderer/helpers/NumberHelper'

import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import { TUseBalanceOptionShowType } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

const AccountTokensList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTokensList' })
  const { account } = useOutletContext<TOutletContext>()
  const { currency } = useCurrencySelector()

  const [tab, setTab] = useState<TUseBalanceOptionShowType>('active')

  const balances = useBalances([account], { showType: tab })

  return (
    <AccountDetailsLayout
      heading={t('title')}
      actions={account ? <CommonAccountActions account={account} /> : undefined}
    >
      <Tabs.Root value={tab} onValueChange={value => setTab(value as TUseBalanceOptionShowType)}>
        <Tabs.List className="relative mt-3">
          <Tabs.Trigger value="active">{t('tabs.active')}</Tabs.Trigger>
          <Tabs.Trigger value="hidden">{t('tabs.hidden')}</Tabs.Trigger>

          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-2">
            <p className="text-sm text-gray-300">{t('balance')}</p>

            {balances.isLoading ? (
              <Loader className="h-4 w-4" />
            ) : (
              <span className="text-sm text-white">
                {NumberHelper.currency(balances.exchangeTotal, currency.label)}
              </span>
            )}
          </div>
        </Tabs.List>
      </Tabs.Root>

      <TokensTable accounts={[account]} showType={tab} />
    </AccountDetailsLayout>
  )
}

export default AccountTokensList
