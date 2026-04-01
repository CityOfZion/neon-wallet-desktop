import { cloneElement, useLayoutEffect } from 'react'

import { hasNft, hasWalletConnect } from '@cityofzion/blockchain-service'
import isEqual from 'lodash/isEqual'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { type Location, useLocation, useNavigate, useOutlet } from 'react-router'

import { ActionPopover } from '@renderer/components/ActionPopover'
import { Button } from '@renderer/components/Button'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { IconButton } from '@renderer/components/IconButton'
import { MenuLink } from '@renderer/components/MenuLink'
import { RefreshAction } from '@renderer/components/RefreshAction'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useAccountsMapSelector, useHasHardwareAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBridgeNeo3NeoXValidations } from '@renderer/hooks/useBridgeNeo3NeoXValidations'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedAccountSelector, useSelectedWalletSelector } from '@renderer/hooks/useSettingsSelector'
import { useWalletsMapSelector, useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import { MainLayout } from '@renderer/layouts/Main'

import MdAdd from '@renderer/assets/images/md-add.svg?react'
import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'
import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbDotsVertical from '@renderer/assets/images/tb-dots-vertical.svg?react'
import TbFileExport from '@renderer/assets/images/tb-file-export.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbShieldCheck from '@renderer/assets/images/tb-shield-check.svg?react'
import TbUpload from '@renderer/assets/images/tb-upload.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TAccount, TWallet } from '@shared/types/store'

import { AccountList } from './AccountList'
import { HardwareWalletConnectedBadge } from './HardwareWalletConnectedBadge'
import { PanelTransition } from './PanelTransition'
import { WalletsSelect } from './WalletsSelect'

type TLocationState = {
  account?: TAccount
}

const WalletsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })
  const { wallets } = useWalletsSelector()
  const { hasHardwareAccount } = useHasHardwareAccountSelector()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { loginSession } = useLoginSessionSelector()
  const { selectedWallet } = useSelectedWalletSelector()
  const { selectedAccount } = useSelectedAccountSelector()
  const { accountsMapRef } = useAccountsMapSelector()
  const { walletsMapRef } = useWalletsMapSelector()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation() as Location<TLocationState>
  const { canAccountBridge } = useBridgeNeo3NeoXValidations(selectedAccount)
  const outlet = useOutlet({ account: selectedAccount })

  const service = selectedAccount
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[selectedAccount.blockchain]
    : undefined

  const isKeyLoginSession = loginSession?.type === 'key'
  const menuLayoutId = `wallets-menu-link-${selectedAccount?.id}`
  const hasNftMenuItem = service && hasNft(service)

  const handleSelectAccount = (selected: TAccount) => {
    navigate(location.pathname, { state: { account: selected } })
  }

  const handleSelectWallet = (selected: TWallet) => {
    navigate(location.pathname, { state: { account: selected.accounts[0] } })
  }

  const handleExportMnemonic = () => {
    modalNavigate('confirm-password-export', {
      state: {
        title: t('exportWalletTitle'),
        icon: <TbFileExport aria-hidden />,
        onSubmitPassword: () =>
          modalNavigate('export-mnemonic', {
            state: {
              wallet: selectedWallet!,
            },
            replace: true,
          }),
      },
    })
  }

  const handleExportKey = () => {
    modalNavigate('confirm-password-export', {
      state: {
        title: t('exportKeyTitle'),
        icon: <TbUpload aria-hidden />,
        onSubmitPassword: () =>
          modalNavigate('export-key', {
            state: {
              account: selectedAccount!,
            },
            replace: true,
          }),
      },
    })
  }

  const handleGoToNeo3Vote = () => {
    if (selectedAccount!.blockchain !== 'neo3') return
    navigate('/neo3-vote', { state: { defaultNeo3Account: selectedAccount } })
  }

  const handleNeo3NeoXBridge = () => {
    navigate('/neo3-neoX-bridge', { state: { account: selectedAccount } })
  }

  const handleGoToManageTrustlines = () => {
    if (!selectedAccount || selectedAccount.blockchain !== 'stellar') return
    modalNavigate('stellar-trustlines', { state: { stellarAccount: selectedAccount } })
  }

  useLayoutEffect(() => {
    const stateAccount = location.state?.account

    const getNextSelectedWallet = () => {
      const firstWallet = wallets[0]

      if (stateAccount) {
        return walletsMapRef.current.get(stateAccount.idWallet) || firstWallet
      }

      if (selectedWallet) {
        return walletsMapRef.current.get(selectedWallet.id) || firstWallet
      }

      return firstWallet
    }

    const getNextSelectedAccount = (nextSelectedWallet: TWallet) => {
      const firstAccount = nextSelectedWallet.accounts[0]

      if (stateAccount?.idWallet === nextSelectedWallet.id) {
        return accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(stateAccount)) || firstAccount
      }

      if (selectedAccount?.idWallet === nextSelectedWallet.id) {
        return accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(selectedAccount)) || firstAccount
      }

      return firstAccount
    }

    const nextSelectedWallet = getNextSelectedWallet()
    const nextSelectedAccount = getNextSelectedAccount(nextSelectedWallet)

    if (!isEqual(selectedWallet, nextSelectedWallet)) {
      dispatch(settingsReducerActions.setSelectedWallet(nextSelectedWallet))
    }

    if (!isEqual(selectedAccount, nextSelectedAccount)) {
      dispatch(settingsReducerActions.setSelectedAccount(nextSelectedAccount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, location.state])

  useLayoutEffect(() => {
    if (!hasNftMenuItem && location.pathname.startsWith('/wallets/nfts')) {
      navigate('/wallets/overview', { state: { account: selectedAccount } })
    }
  }, [hasNftMenuItem, navigate, location.pathname, selectedAccount])

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
            onClick={modalNavigateWrapper('edit-wallet', { state: { wallet: selectedWallet! } })}
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

          <ActionPopover.Separator />
        </CommonScreenActions>
      }
      {...TestHelper.buildTestObject('wallets-screen')}
    >
      {selectedWallet && selectedAccount && service && (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedWallet.id}
            className="flex min-h-0 grow gap-x-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.1 }}
          >
            <section
              key={selectedWallet.id}
              className="flex w-full max-w-46.5 min-w-46.5 flex-col rounded-sm border border-gray-300/10 bg-gray-800 drop-shadow-lg"
            >
              <header className="flex h-fit items-center justify-between gap-x-1 px-4 py-3">
                <h2 className="truncate text-sm">{t('accounts')}</h2>
              </header>

              <main className="flex min-h-0 w-full grow flex-col items-center">
                <Separator containerClassName="px-4" />

                <AccountList
                  selectedWallet={selectedWallet}
                  onSelect={handleSelectAccount}
                  selectedAccount={selectedAccount}
                />
              </main>

              {(selectedWallet.encryptedMnemonic || (selectedWallet.type === 'hardware' && hasHardwareAccount)) && (
                <footer className="flex flex-col gap-3 px-4 pb-6">
                  <Separator />

                  <Button
                    label={t('addAccountButtonLabel')}
                    variant="outlined"
                    className="w-full"
                    flat
                    leftIcon={<MdAdd aria-hidden />}
                    onClick={modalNavigateWrapper('persist-account', { state: { wallet: selectedWallet } })}
                  />
                </footer>
              )}
            </section>

            <div className="relative flex min-h-0 w-full">
              <AnimatePresence mode="popLayout" initial={false}>
                <PanelTransition
                  key={selectedAccount.id}
                  className="flex flex-col rounded-sm border border-gray-300/10 bg-gray-800"
                >
                  <header className="flex h-12 w-full items-center justify-between px-5">
                    <div className="flex items-center gap-2 text-sm">
                      <h1 className="pr-3 text-white">{selectedAccount.name}</h1>
                      <p className="text-gray-300">{t('address')}</p>
                      <p className="text-gray-100">{StringHelper.truncateStringMiddle(selectedAccount.address, 8)}</p>
                      <IconButton
                        icon={<MdOutlineContentCopy aria-hidden />}
                        colorSchema="neon"
                        compacted
                        onClick={ClipboardHelper.write.bind(null, selectedAccount.address)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <RefreshAction />

                      <ActionPopover.Root>
                        <ActionPopover.Trigger asChild>
                          <IconButton icon={<TbDotsVertical aria-hidden />} size="md" compacted />
                        </ActionPopover.Trigger>

                        <ActionPopover.Content side="bottom" sideOffset={-8} align="end">
                          <ActionPopover.Item
                            leftIcon={<TbPencil aria-hidden />}
                            onClick={modalNavigateWrapper('persist-account', { state: { account: selectedAccount } })}
                            label={t('editAccountButton')}
                            textClassName="text-start text-white"
                          />

                          {selectedAccount.type !== 'watch' &&
                            selectedAccount.type !== 'hardware' &&
                            !isKeyLoginSession && (
                              <ActionPopover.Item
                                leftIcon={<TbUpload aria-hidden />}
                                onClick={handleExportKey}
                                label={t('exportKeyButtonLabel')}
                                textClassName="text-start text-white"
                              />
                            )}

                          {canAccountBridge && (
                            <ActionPopover.Item
                              label={t('neo3NeoXBridgeButtonLabel')}
                              textClassName="text-start text-white"
                              leftIcon={<TbReplace2 aria-hidden />}
                              onClick={handleNeo3NeoXBridge}
                            />
                          )}

                          {selectedAccount.blockchain === 'neo3' && (
                            <ActionPopover.Item
                              label={t('neo3VoteButtonLabel')}
                              textClassName="text-start text-white"
                              leftIcon={<TbChartBarPopular aria-hidden />}
                              onClick={handleGoToNeo3Vote}
                            />
                          )}

                          {selectedAccount.blockchain === 'stellar' && (
                            <ActionPopover.Item
                              label={t('stellarTrustlineButtonLabel')}
                              textClassName="text-start text-white"
                              leftIcon={<TbShieldCheck aria-hidden />}
                              onClick={handleGoToManageTrustlines}
                            />
                          )}
                        </ActionPopover.Content>
                      </ActionPopover.Root>
                    </div>
                  </header>

                  <div className="flex h-full min-h-0 bg-gray-900/30">
                    <ul className="w-full max-w-46.5 min-w-46.5 border-r border-gray-300/30">
                      <li>
                        <MenuLink layoutId={menuLayoutId} to="/wallets/overview" state={{ account: selectedAccount }}>
                          {t('accountOverview.title')}
                        </MenuLink>
                      </li>

                      <li>
                        <Separator containerClassName="px-3" />

                        <MenuLink layoutId={menuLayoutId} to="/wallets/tokens" state={{ account: selectedAccount }}>
                          {t('accountTokensList.title')}
                        </MenuLink>
                      </li>

                      {hasNftMenuItem && (
                        <li>
                          <Separator containerClassName="px-3" />

                          <MenuLink layoutId={menuLayoutId} to="/wallets/nfts" state={{ account: selectedAccount }}>
                            {t('accountNftList.title')}
                          </MenuLink>
                        </li>
                      )}

                      <li>
                        <Separator containerClassName="px-3" />

                        <MenuLink
                          layoutId={menuLayoutId}
                          to="/wallets/transactions"
                          state={{ account: selectedAccount }}
                        >
                          {t('accountTransactionsList.title')}
                        </MenuLink>
                      </li>

                      {selectedAccount.type !== 'watch' && hasWalletConnect(service) && (
                        <li>
                          <Separator containerClassName="px-3" />

                          <MenuLink
                            layoutId={menuLayoutId}
                            to="/wallets/connections"
                            state={{ account: selectedAccount }}
                          >
                            {t('accountConnections.title')}
                          </MenuLink>
                        </li>
                      )}
                    </ul>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.1 }}
                        className="flex h-full w-full min-w-0 flex-col"
                      >
                        {outlet && cloneElement(outlet)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </PanelTransition>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </MainLayout>
  )
}

export default WalletsPage
