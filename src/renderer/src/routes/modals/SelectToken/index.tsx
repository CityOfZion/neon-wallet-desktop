import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { TokensTable } from '@renderer/components/TokensTable'
import { useBalances } from '@renderer/hooks/useBalances'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

type TTokenState = {
  selectedAccount: IAccountState
  onSelectToken: (token: TTokenBalance) => void
}

export const SelectToken = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'selectToken' })
  const { modalNavigate } = useModalNavigate()
  const { selectedAccount, onSelectToken } = useModalState<TTokenState>()
  const balances = useBalances([selectedAccount])
  const [selectedToken, setSelectedToken] = useState<TTokenBalance>()

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
          balances={balances}
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
