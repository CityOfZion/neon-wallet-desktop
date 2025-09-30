import { Fragment, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { hasNft } from '@cityofzion/blockchain-service'
import MdAdd from '@renderer/assets/images/md-add.svg?react'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbDotsVertical from '@renderer/assets/images/tb-dots-vertical.svg?react'
import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbUpload from '@renderer/assets/images/tb-upload.svg?react'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { Button } from '@renderer/components/Button'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { IconButton } from '@renderer/components/IconButton'
import { RefreshAction } from '@renderer/components/RefreshAction'
import { Separator } from '@renderer/components/Separator'
import { SidebarMenuButton } from '@renderer/components/SidebarMenuButton'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useAccountsSelector, useHasHardwareAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBridgeNeo3NeoXValidations } from '@renderer/hooks/useBridgeNeo3NeoXValidations'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { MainLayout } from '@renderer/layouts/Main'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState, IWalletState } from '@shared/@types/store'

import { AccountList } from './AccountList'
import { HardwareWalletConnectedBadge } from './HardwareWalletConnectedBadge'
import { WalletsSelect } from './WalletsSelect'

type TParams = {
  id: string
}

export const WalletsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const { hasHardwareAccount } = useHasHardwareAccountSelector()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const navigate = useNavigate()
  const { id } = useParams<TParams>()

  const [selectedWallet, setSelectedWallet] = useState<IWalletState | undefined>(wallets[0])
  const [selectedAccount, setSelectedAccount] = useState<IAccountState | undefined>(
    accounts.find(account => account.idWallet === selectedWallet?.id)
  )

  const { canAccountBridge } = useBridgeNeo3NeoXValidations(selectedAccount)

  const service = selectedAccount ? bsAggregator.blockchainServicesByName[selectedAccount.blockchain] : undefined
  const isKeyLoginSession = currentLoginSession?.type === 'key'

  const handleSelectAccount = (selected: IAccountState) => {
    navigate(`/app/wallets/${selected.id}/overview`)
  }

  const handleSelectWallet = (selected: IWalletState) => {
    const firstAccount = accounts.find(account => account.idWallet === selected.id)
    if (!firstAccount) return
    navigate(`/app/wallets/${firstAccount.id}/overview`)
  }

  const handleExportKey = () => {
    modalNavigate('confirm-password-export', {
      state: {
        title: t('exportKeyTitle'),
        icon: <TbUpload aria-hidden={true} />,
        onSubmitPassword: () =>
          modalNavigate('export-key', {
            state: {
              account: selectedAccount,
            },
            replace: true,
          }),
      },
    })
  }

  const handleExportMnemonic = () => {
    modalNavigate('confirm-password-export', {
      state: {
        title: t('exportWalletTitle'),
        icon: <TbFileExport aria-hidden={true} />,
        onSubmitPassword: () =>
          modalNavigate('export-mnemonic', {
            state: {
              wallet: selectedWallet,
            },
            replace: true,
          }),
      },
    })
  }

  const handleGoToVoteNeo3 = () => {
    if (selectedAccount!.blockchain !== 'neo3') return

    navigate('/app/vote-neo3', { state: { defaultNeo3Account: selectedAccount } })
  }

  const handleNeo3NeoXBridge = () => {
    navigate('/app/neo3-neoX-bridge', { state: { account: selectedAccount } })
  }

  useLayoutEffect(() => {
    const navigateToFirstAccount = () => {
      const [wallet] = wallets
      const firstAccount = accounts.find(account => account.idWallet === wallet?.id)
      if (firstAccount) navigate(`/app/wallets/${firstAccount.id}/overview`)
    }

    if (!id) {
      navigateToFirstAccount()
      return
    }

    const account = accounts.find(account => account.id === id)
    if (!account) {
      navigateToFirstAccount()
      return
    }

    const wallet = wallets.find(wallet => wallet.id === account.idWallet)
    if (!wallet) {
      navigateToFirstAccount()
      return
    }

    setSelectedWallet(wallet)
    setSelectedAccount(account)
  }, [id, wallets, accounts, navigate])

  return (
    <MainLayout
      heading={
        <div className="flex items-center gap-2">
          <WalletsSelect wallets={wallets} value={selectedWallet} onSelect={handleSelectWallet} />
          {hasHardwareAccount && <HardwareWalletConnectedBadge />}
        </div>
      }
      rightComponent={
        <CommonScreenActions>
          <ActionPopover.Item
            actionPopoverItemType="button"
            leftIcon={<TbPencil aria-hidden className="text-neon" />}
            label={t('editWalletButtonLabel')}
            onClick={modalNavigateWrapper('edit-wallet', { state: { wallet: selectedWallet } })}
            colorSchema="white"
          />

          <ActionPopover.Separator />

          {selectedWallet?.type === 'standard' && selectedWallet?.encryptedMnemonic && !isKeyLoginSession && (
            <ActionPopover.Item
              actionPopoverItemType="button"
              leftIcon={<TbFileExport aria-hidden className="text-neon" />}
              label={t('exportButtonLabel')}
              colorSchema="white"
              onClick={handleExportMnemonic}
            />
          )}
        </CommonScreenActions>
      }
      contentClassName="flex-row gap-x-3"
      {...TestHelper.buildTestObject('wallets-screen')}
    >
      {selectedWallet && selectedAccount && service && (
        <Fragment>
          <section className="flex w-full min-w-[11.625rem] max-w-[11.625rem] flex-col rounded bg-gray-800 drop-shadow-lg">
            <header className="flex h-fit items-center justify-between gap-x-1 px-4 py-3">
              <h2 className="truncate text-sm">{t('accounts')}</h2>
            </header>

            <main className="flex min-h-0 w-full flex-grow flex-col items-center">
              <div className="w-full px-4">
                <Separator />
              </div>

              <AccountList
                selectedWallet={selectedWallet}
                onSelect={handleSelectAccount}
                selectedAccount={selectedAccount}
              />
            </main>

            {(selectedWallet.encryptedMnemonic || (selectedWallet.type === 'hardware' && hasHardwareAccount)) && (
              <footer className="px-4 pb-6 pt-3">
                <Button
                  label={t('addAccountButtonLabel')}
                  variant="outlined"
                  className="w-full"
                  flat
                  leftIcon={<MdAdd aria-hidden={true} />}
                  onClick={modalNavigateWrapper('persist-account', { state: { wallet: selectedWallet } })}
                />
              </footer>
            )}
          </section>

          <section className="flex h-full w-full min-w-0 flex-grow flex-col rounded bg-gray-800">
            <header className="flex h-12 w-full items-center justify-between px-5">
              <div className="flex items-center gap-2 text-sm">
                <h1 className="pr-3 text-white">{selectedAccount.name}</h1>
                <p className="text-gray-300">{t('address')}</p>
                <p className="text-gray-100">{StringHelper.truncateStringMiddle(selectedAccount.address, 8)}</p>
                <IconButton
                  icon={<MdOutlineContentCopy aria-hidden={true} />}
                  colorSchema="neon"
                  compacted
                  onClick={() => UtilsHelper.copyToClipboard(selectedAccount.address)}
                />
              </div>

              <div className="flex gap-2">
                <RefreshAction />

                <ActionPopover.Root>
                  <ActionPopover.Trigger asChild>
                    <IconButton icon={<TbDotsVertical aria-hidden={true} />} size="md" compacted />
                  </ActionPopover.Trigger>

                  <ActionPopover.Content side="bottom" sideOffset={-8} align="end">
                    <ActionPopover.Item
                      leftIcon={<TbPencil aria-hidden={true} />}
                      onClick={modalNavigateWrapper('persist-account', { state: { account: selectedAccount } })}
                      label={t('editAccountButton')}
                      textClassName="text-start text-white"
                    />

                    {selectedAccount?.type !== 'watch' &&
                      selectedAccount?.type !== 'hardware' &&
                      !isKeyLoginSession && (
                        <ActionPopover.Item
                          leftIcon={<TbUpload aria-hidden={true} />}
                          onClick={handleExportKey}
                          label={t('exportKeyButtonLabel')}
                          textClassName="text-start text-white"
                        />
                      )}

                    {canAccountBridge && (
                      <ActionPopover.Item
                        label={t('neo3NeoXBridgeButtonLabel')}
                        textClassName="text-start text-white"
                        leftIcon={<TbReplace2 aria-hidden={true} />}
                        onClick={handleNeo3NeoXBridge}
                      />
                    )}

                    {selectedAccount?.blockchain === 'neo3' && (
                      <ActionPopover.Item
                        label={t('voteNeo3ButtonLabel')}
                        textClassName="text-start text-white"
                        leftIcon={<TbChartBarPopular aria-hidden={true} />}
                        onClick={handleGoToVoteNeo3}
                      />
                    )}
                  </ActionPopover.Content>
                </ActionPopover.Root>
              </div>
            </header>

            <div className="flex h-full min-h-0 bg-gray-900/30">
              <ul className="w-full min-w-[11.625rem] max-w-[11.625rem] border-r border-gray-300/30">
                <SidebarMenuButton
                  title={t('accountOverview.title')}
                  to={`/app/wallets/${selectedAccount.id}/overview`}
                />
                <SidebarMenuButton
                  title={t('accountTokensList.title')}
                  to={`/app/wallets/${selectedAccount.id}/tokens`}
                />
                {service && hasNft(service) && (
                  <SidebarMenuButton title={t('accountNftList.title')} to={`/app/wallets/${selectedAccount.id}/nfts`} />
                )}
                <SidebarMenuButton
                  title={t('accountTransactionsList.title')}
                  to={`/app/wallets/${selectedAccount.id}/transactions`}
                />

                {selectedAccount?.type !== 'watch' &&
                  WalletConnectHelper.supportedBlockchains[selectedAccount.blockchain] && (
                    <SidebarMenuButton
                      title={t('accountConnections.title')}
                      to={`/app/wallets/${selectedAccount.id}/connections`}
                    />
                  )}
              </ul>

              <Outlet context={{ account: selectedAccount }} key={selectedAccount.id} />
            </div>
          </section>
        </Fragment>
      )}
    </MainLayout>
  )
}
