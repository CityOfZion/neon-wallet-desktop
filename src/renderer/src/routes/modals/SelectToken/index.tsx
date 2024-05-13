import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { TokenBalance } from '@renderer/@types/query'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { TokensTable } from '@renderer/components/TokensTable'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TTokenState = {
  selectedAccount: IAccountState
  onSelectToken: (token: TokenBalance) => void
}

export const SelectToken = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'selectToken' })
  const { modalNavigate } = useModalNavigate()
  const { selectedAccount, onSelectToken } = useModalState<TTokenState>()
  const balanceExchange = useBalancesAndExchange([selectedAccount])
  const [selectedToken, setSelectedToken] = useState<TokenBalance>()

  const selectToken = () => {
    if (!selectedToken) {
      return
    }
    onSelectToken(selectedToken)
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbStepOut />}>
      <section className="w-full flex flex-col h-full items-center min-w-0">
        <h2 className="text-sm text-left w-full">{t('yourBalances')}</h2>

        <TokensTable
          balanceExchange={balanceExchange}
          showSimplified
          onTokenSelected={setSelectedToken}
          selectedToken={selectedToken}
        />

        <Button
          className="w-[16rem]"
          type="submit"
          label={t('selectToken')}
          disabled={!selectedToken}
          onClick={selectToken}
        />
      </section>
    </SideModalLayout>
  )
}
