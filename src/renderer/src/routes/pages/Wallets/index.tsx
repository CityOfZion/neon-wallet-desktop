import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdAdd, MdMoreVert, MdOutlineContentCopy } from 'react-icons/md'
import { TbFileImport, TbPencil, TbRepeat } from 'react-icons/tb'
import { Outlet, useNavigate } from 'react-router-dom'
import { EStatus } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { IAccountState, IWalletState } from '@renderer/@types/store'
import { AccountList } from '@renderer/components/AccountList'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { SidebarMenuButton } from '@renderer/components/SidebarMenuButton'
import { WalletCard } from '@renderer/components/WalletCard'
import { WalletSelect } from '@renderer/components/WalletSelect'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { MainLayout } from '@renderer/layouts/Main'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'

export const WalletsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { modalNavigateWrapper } = useModalNavigate()
  const navigate = useNavigate()
  const { status } = useWalletConnectWallet()

  const [selectedWallet, setSelectedWallet] = useState<IWalletState | undefined>(wallets[0])
  const [isReordering, setIsReordering] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<IAccountState | undefined>(undefined)

  const balanceExchange = useBalancesAndExchange(accounts)

  const handleReorderSave = (accountsOrder: string[]) => {
    dispatch(accountReducerActions.reorderAccounts(accountsOrder))
    setIsReordering(false)
  }

  const handleReorderCancel = () => {
    setIsReordering(false)
  }

  const handleSelectWallet = (selected: IWalletState) => {
    setSelectedWallet(selected)
  }

  const handleSelectAccount = (selected: IAccountState) => {
    setSelectedAccount(selected)
    navigate(`/wallets/${selected.address}/overview`)
  }

  useEffect(() => {
    setSelectedWallet(prev => {
      if (prev) {
        const updatedWallet = wallets.find(wallet => wallet.id === prev.id)
        if (updatedWallet) {
          return updatedWallet
        }
      }

      return wallets[0]
    })
  }, [wallets])

  useEffect(() => {
    setSelectedAccount(undefined)
  }, [selectedWallet, accounts])

  return (
    <MainLayout
      heading={
        <div>
          <WalletSelect
            balanceExchange={balanceExchange}
            wallets={wallets}
            selected={selectedWallet}
            onSelect={setSelectedWallet}
            disabled={isReordering}
          />
        </div>
      }
      rightComponent={
        <div className="flex gap-x-2">
          <IconButton
            icon={<TbPencil />}
            size="md"
            text={t('editWalletButtonLabel')}
            onClick={modalNavigateWrapper('edit-wallet', { state: { wallet: selectedWallet } })}
          />
          <IconButton icon={<MdAdd />} size="md" text={t('newWalletButtonLabel')} disabled />
          <IconButton
            icon={<TbFileImport />}
            size="md"
            text={t('importButtonLabel')}
            onClick={modalNavigateWrapper('import', {
              state: {
                onImportWallet: handleSelectWallet,
              },
            })}
          />
        </div>
      }
      contentClassName="flex-row gap-x-3"
    >
      {selectedWallet && (
        <section className="bg-gray-800 rounded drop-shadow-lg max-w-[11.625rem] min-w-[11.625rem] w-full flex flex-col">
          <header className="flex justify-between pl-4 pr-2 py-3 items-center h-fit gap-x-1">
            <h2 className="text-sm truncate">{selectedWallet.name}</h2>

            <ActionPopover
              actions={[
                {
                  icon: <TbPencil />,
                  label: t('editWalletButtonLabel'),
                  onClick: modalNavigateWrapper('edit-wallet', { state: { wallet: selectedWallet } }),
                },
                {
                  icon: <TbRepeat />,
                  label: t('reorderAccountsButtonLabel'),
                  onClick: () => setIsReordering(true),
                },
              ]}
            >
              <IconButton compacted icon={<MdMoreVert />} size="md" disabled={isReordering} />
            </ActionPopover>
          </header>

          <main className="flex-grow">
            <Separator />
            <WalletCard
              onClick={() => setSelectedAccount(undefined)}
              wallet={selectedWallet}
              iconWithAccounts
              balanceExchange={balanceExchange}
              active={selectedAccount === undefined}
            />
            <AccountList
              selectedWallet={selectedWallet}
              balanceExchange={balanceExchange}
              isReordering={isReordering}
              onReorderCancel={handleReorderCancel}
              onReorderSave={handleReorderSave}
              onSelect={handleSelectAccount}
              selectedAccount={selectedAccount}
            />
          </main>

          <footer className="px-4 pb-6">
            {selectedAccount && (
              <Button
                label={t('editAccountButton')}
                variant="outlined"
                className="w-full pb-2"
                flat
                onClick={modalNavigateWrapper('edit-account', { state: { account: selectedAccount } })}
                leftIcon={<TbPencil />}
              />
            )}
            <Button
              label={t('addAccountButtonLabel')}
              variant="outlined"
              className="w-full"
              flat
              disabled
              leftIcon={<MdAdd />}
            />
          </footer>
        </section>
      )}

      <section className="bg-gray-800 w-full h-full flex rounded flex-grow flex-col">
        <header className="w-full h-14 items-center flex justify-between px-5 bg-gray-800">
          <div className="flex items-center">
            <h1 className="text-white text-sm pr-5">{selectedAccount?.name}</h1>
            <h1 className="text-gray-300 text-sm pr-2">{t('address')}</h1>
            <h1 className="text-white text-sm">
              {StringHelper.truncateStringMiddle(selectedAccount?.address ?? '', 8)}
            </h1>
            <IconButton
              icon={<MdOutlineContentCopy className="text-neon" />}
              size="sm"
              onClick={() => UtilsHelper.copyToClipboard(selectedAccount?.address ?? '')}
            />
          </div>
          {selectedAccount && (
            <Button
              leftIcon={<TbPencil className="text-gray-100 w-5 h-5" />}
              label={t('editAccountButton')}
              className="w-fit"
              variant="text"
              colorSchema="gray"
              clickableProps={{ className: 'text-xs' }}
              onClick={modalNavigateWrapper('edit-account', { state: { account: selectedAccount } })}
            />
          )}
        </header>
        <div className="flex h-full bg-gray-900/30 min-h-0">
          <section className="h-full rounded drop-shadow-lg max-w-[11.625rem] min-w-[11.625rem] w-full flex flex-col border-r border-gray-300/30">
            <ul className="max-w-full w-full">
              <SidebarMenuButton title={t('overview')} to={`/wallets/${selectedAccount?.address}/overview`} />
              <SidebarMenuButton title={t('tokens')} to={`/wallets/${selectedAccount?.address}/tokens`} />
              <SidebarMenuButton title={t('nfts')} to={`/wallets/${selectedAccount?.address}/nfts`} />
              <SidebarMenuButton title={t('transactions')} to={`/wallets/${selectedAccount?.address}/transactions`} />
              <SidebarMenuButton
                title={t('connections')}
                type="button"
                disabled={status !== EStatus.STARTED}
                onClick={modalNavigateWrapper('dapp-connection-list')}
              />
            </ul>
          </section>
          <Outlet />
        </div>
      </section>
    </MainLayout>
  )
}
