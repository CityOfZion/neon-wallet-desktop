import { Fragment, type JSX, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Select } from '@renderer/components/Select'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdCheck from '@renderer/assets/images/md-check.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { IAccountState, IWalletState } from '@shared/types/store'

type TLocationState = {
  onSelectAccount: (contact: IAccountState) => void
  title: string
  buttonLabel: string
  leftIcon?: JSX.Element
  blockchain?: TBlockchainServiceKey
}

const SelectAccountModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'selectAccount' })
  const { t: tCommon } = useTranslation('common')

  const { onSelectAccount, leftIcon, title, buttonLabel, blockchain } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()

  const [selectedWallet, setSelectedWallet] = useState<IWalletState | undefined>(undefined)
  const [selectedAccount, setSelectedAccount] = useState<IAccountState | undefined>(undefined)

  const filteredAccounts = useMemo(
    () => accounts.filter(account => account.type !== 'watch' && (!blockchain || account.blockchain === blockchain)),
    [accounts, blockchain]
  )

  const filteredWallets = useMemo(() => {
    const walletsArray: IWalletState[] = []

    wallets.forEach(wallet => {
      if (filteredAccounts.some(account => account.idWallet === wallet.id)) {
        walletsArray.push(wallet)
      }
    })

    return walletsArray
  }, [wallets, filteredAccounts])

  const selectedWalletAccounts = useMemo(() => {
    if (!selectedWallet) {
      return []
    }
    return filteredAccounts.filter(account => account.idWallet === selectedWallet.id)
  }, [selectedWallet, filteredAccounts])

  const handleSelectWallet = (id: string) => {
    const wallet = filteredWallets.find(wallet => wallet.id === id)!

    setSelectedWallet(wallet)
    setSelectedAccount(undefined)
  }

  const handleSelectAccount = (account: IAccountState) => {
    setSelectedAccount(account)
  }

  const handleSelectFinish = () => {
    if (!selectedAccount) {
      return
    }
    modalNavigate(-1)
    onSelectAccount(selectedAccount)
  }

  return (
    <SideModalLayout heading={title ?? t('title')} headingIcon={leftIcon} contentClassName="flex flex-col min-h-0">
      <Select.Root value={selectedWallet?.id} onValueChange={handleSelectWallet}>
        <Select.Trigger
          className={StyleHelper.mergeStyles('bg-asphalt', {
            'text-gray-300': !selectedWallet,
          })}
        >
          <Select.Value placeholder={t('placeholder')} />

          <Select.Icon className="text-neon" />
        </Select.Trigger>

        <Select.Content>
          {filteredWallets.map((wallet, index) => (
            <Fragment key={wallet.id}>
              <Select.Item
                value={wallet.id}
                className="flex cursor-pointer items-center justify-start gap-x-2 text-sm text-gray-100 hover:bg-gray-300/15"
              >
                <Select.ItemText>{wallet.name}</Select.ItemText>
              </Select.Item>

              {index + 1 !== filteredWallets.length && <Select.Separator />}
            </Fragment>
          ))}
        </Select.Content>
      </Select.Root>

      {selectedWallet && (
        <section className="mt-5 flex min-h-0 w-full grow flex-col items-center text-sm">
          <p className="w-full pl-[0.2em] text-left">{t('yourAccounts')}</p>

          <ul className="mt-2 mb-5 flex h-full min-h-0 w-full flex-col overflow-y-auto">
            {selectedWalletAccounts.length <= 0 ? (
              <p className="mt-5 text-gray-300">{t('noAccounts')}</p>
            ) : (
              selectedWalletAccounts.map((account, index) => (
                <li key={account.id}>
                  <button
                    aria-selected={selectedAccount?.id === account.id}
                    className="hover:border-l-neon hover:bg-asphalt aria-selected:border-l-neon aria-selected:bg-asphalt flex w-full cursor-pointer items-center justify-between gap-x-4 border-l-2 border-transparent p-2.5 pl-4 transition-colors"
                    onClick={handleSelectAccount.bind(null, account)}
                  >
                    <div className="flex min-w-0 items-center gap-x-4">
                      <BlockchainIcon blockchain={account.blockchain} type="gray" className="min-h-4 min-w-4" />
                      <div className="flex flex-col text-left">
                        <span className="truncate text-sm text-white">{account.name}</span>
                        <span className="truncate text-xs text-gray-300">
                          {StringHelper.truncateStringMiddle(account.address, 22)}
                        </span>
                      </div>
                    </div>

                    {selectedAccount?.id === account.id && (
                      <MdCheck aria-hidden className="text-neon h-5 min-h-5 w-5 min-w-5" />
                    )}
                  </button>

                  {index + 1 !== selectedWalletAccounts.length && <Separator />}
                </li>
              ))
            )}
          </ul>

          <Button
            className="w-full px-5"
            type="submit"
            label={buttonLabel ?? tCommon('general.next')}
            disabled={!selectedAccount}
            onClick={handleSelectFinish}
          />
        </section>
      )}
    </SideModalLayout>
  )
}

export default SelectAccountModal
