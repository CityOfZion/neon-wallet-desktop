import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbFileImport } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AccountWithDerivationPath } from '@cityofzion/blockchain-service'
import { AccountSelection } from '@renderer/components/AccountSelection'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useMount } from '@renderer/hooks/useMount'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TAccountsToImport, TBlockchainServiceKey } from '@shared/@types/blockchain'

type TLocation = {
  mnemonic: string
}

type TActionsData = {
  mnemonicAccounts: Map<TBlockchainServiceKey, AccountWithDerivationPath[]>
  selectedAccounts: TAccountWithBlockchain[]
}

type TAccountWithBlockchain = AccountWithDerivationPath & { blockchain: TBlockchainServiceKey }

export const ImportMnemonicAccountsSelectionModal = () => {
  const { mnemonic } = useModalState<TLocation>()
  const blockchainActions = useBlockchainActions()
  const { t: commonT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'importMnemonicAccountsSelection' })
  const { doesAccountExist } = useAccountUtils()

  const { actionData, setData, actionState, handleAct } = useActions<TActionsData>({
    mnemonicAccounts: new Map(),
    selectedAccounts: [],
  })

  const handleChecked = (checked: boolean, account: TAccountWithBlockchain) => {
    setData(({ selectedAccounts }) => ({
      selectedAccounts: checked
        ? [...selectedAccounts, account]
        : selectedAccounts.filter(AccountHelper.predicateNot(account)),
    }))
  }

  const handleImport = async (data: TActionsData) => {
    const wallet = blockchainActions.createWallet({
      name: commonT('mnemonicWalletName'),
      mnemonic,
    })

    const accountsToImport: TAccountsToImport = data.selectedAccounts.map(({ address, blockchain, key }) => ({
      address,
      blockchain,
      key,
      type: 'standard',
    }))

    const accounts = await blockchainActions.importAccounts({
      accounts: accountsToImport,
      wallet,
    })

    modalNavigate(-2)
    navigate(`/app/wallets/${accounts[0].id}/overview`)
  }

  const { isMounting } = useMount(async () => {
    const mnemonicAccounts = await bsAggregator.generateAccountFromMnemonicAllBlockchains(mnemonic)

    const selectedAccounts: TAccountWithBlockchain[] = []

    Array.from(mnemonicAccounts.entries()).forEach(([blockchain, accounts]) => {
      accounts.forEach(account => {
        if (doesAccountExist({ address: account.address, blockchain })) return

        selectedAccounts.push({ ...account, blockchain })
      })
    })

    setData({
      mnemonicAccounts,
      selectedAccounts,
    })
  }, [mnemonic])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbFileImport />} contentClassName="flex flex-col min-h-0">
      <p className="text-sm mr-">{t('description')}</p>

      <div className="flex flex-col gap-y-2.5 mt-6 flex-grow min-h-0 overflow-y-auto mb-3">
        {isMounting ? (
          <Loader />
        ) : actionData.selectedAccounts.length > 0 ? (
          Array.from(actionData.mnemonicAccounts.entries()).map(([blockchain, accounts]) => (
            <Fragment key={blockchain}>
              {accounts.length > 0 && (
                <AccountSelection.Root blockchain={blockchain}>
                  {accounts.map(it => (
                    <AccountSelection.Item
                      key={`${it.address}-${blockchain}`}
                      address={it.address}
                      label={it.derivationPath}
                      checked={actionData.selectedAccounts.some(
                        AccountHelper.predicate({ address: it.address, blockchain })
                      )}
                      disabled={doesAccountExist({ address: it.address, blockchain })}
                      onCheckedChange={checked => handleChecked(checked, { ...it, blockchain })}
                    />
                  ))}
                </AccountSelection.Root>
              )}
            </Fragment>
          ))
        ) : (
          <p className="w-full text-center text-xs text-gray-100">{t('noAccountsToImport')}</p>
        )}
      </div>

      <Button
        className="w-full"
        type="button"
        onClick={handleAct(handleImport)}
        label={t('importButtonLabel')}
        leftIcon={<TbFileImport />}
        loading={actionState.isActing}
        disabled={actionData.selectedAccounts.length === 0}
        flat
      />
    </SideModalLayout>
  )
}
