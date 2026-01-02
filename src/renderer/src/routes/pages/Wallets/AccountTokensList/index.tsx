import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { Loader } from '@renderer/components/Loader'
import { Tabs } from '@renderer/components/Tabs'
import { TokensTable } from '@renderer/components/TokensTable'

import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'

import { useBalances } from '@renderer/hooks/useBalances'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import { TUseBalanceOptionShowType } from '@shared/types/query'
import { IAccountState } from '@shared/types/store'

import { AccountDetailsLayout } from '../AccountDetailsLayout'
import { CommonAccountActions } from '../CommonAccountActions'

type TOutletContext = {
  account: IAccountState
}

const AccountTokensList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountTokensList' })
  const { account } = useOutletContext<TOutletContext>()
  const { currency } = useCurrencySelector()

  const [showType, setShowType] = useState<TUseBalanceOptionShowType>('active')

  const accounts = [account]

  const balances = useBalances(accounts, { showType })

  return (
    <AccountDetailsLayout
      heading={t('title')}
      actions={account ? <CommonAccountActions account={account} /> : undefined}
    >
      <Tabs.Root value={showType} onValueChange={value => setShowType(value as TUseBalanceOptionShowType)}>
        <Tabs.List className="relative mt-3">
          <Tabs.Trigger value="active">{t('tabs.active')}</Tabs.Trigger>
          <Tabs.Trigger value="hidden">{t('tabs.hidden')}</Tabs.Trigger>

          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-2">
            <p className="text-sm text-gray-300">{t('balance')}</p>

            {balances.isLoading ? (
              <Loader className="h-4 w-4" />
            ) : (
              <span className="text-sm text-white">{CurrencyHelper.format(balances.exchangeTotal, { currency })}</span>
            )}
          </div>
        </Tabs.List>

        <Tabs.Content>
          <Tabs.Item value="active">
            <TokensTable accounts={accounts} showType="active" />
          </Tabs.Item>

          <Tabs.Item value="hidden">
            <TokensTable accounts={accounts} showType="hidden" />
          </Tabs.Item>
        </Tabs.Content>
      </Tabs.Root>
    </AccountDetailsLayout>
  )
}

export default AccountTokensList
