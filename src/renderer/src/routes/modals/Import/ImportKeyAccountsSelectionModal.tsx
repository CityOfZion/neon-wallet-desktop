import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbFileImport } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Account } from '@cityofzion/blockchain-service'
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
import { TBlockchainServiceKey, TImportAccountsParam } from '@shared/@types/blockchain'

type TLocation = {
  key: string
}

type TAccountWithBlockchain = Account & { blockchain: TBlockchainServiceKey }

type TActionsData = {
  accountsByBlockchain: Map<TBlockchainServiceKey, TAccountWithBlockchain[]>
  selectedAccounts: TAccountWithBlockchain[]
}

export const ImportKeyAccountsSelectionModal = () => {
  const { key } = useModalState<TLocation>()
  const blockchainActions = useBlockchainActions()
  const { t: commomT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'importKeyAccountsSelection' })
  const { doesAccountExist } = useAccountUtils()

  const { actionData, setData, actionState, handleAct } = useActions<TActionsData>({
    accountsByBlockchain: new Map(),
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
      name: commomT('importedName'),
    })

    const accountsToImport: TImportAccountsParam['accounts'] = data.selectedAccounts.map(({ address, blockchain }) => ({
      address,
      blockchain,
      key,
      type: 'standard',
    }))

    const accounts = await blockchainActions.importAccounts({ wallet, accounts: accountsToImport })

    modalNavigate(-2)
    navigate(`/app/wallets/${accounts[0].id}/overview`)
  }

  const { isMounting } = useMount(async () => {
    const accountsByBlockchain = new Map<TBlockchainServiceKey, TAccountWithBlockchain[]>()
    const selectedAccounts: TAccountWithBlockchain[] = []

    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      const account = service.generateAccountFromKey(key)
      accountsByBlockchain.set(service.blockchainName, [{ ...account, blockchain: service.blockchainName }])

      if (doesAccountExist({ address: account.address, blockchain: service.blockchainName })) return

      selectedAccounts.push({ ...account, blockchain: service.blockchainName })
    })

    setData({
      accountsByBlockchain,
      selectedAccounts,
    })
  }, [key, doesAccountExist])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbFileImport />} contentClassName="flex flex-col">
      <p className="text-sm mr-">{t('description')}</p>

      <div className="flex flex-col gap-y-2.5 mt-6 flex-grow">
        {isMounting ? (
          <Loader />
        ) : Array.from(actionData.accountsByBlockchain.entries()).length > 0 ? (
          Array.from(actionData.accountsByBlockchain.entries()).map(([blockchain, accounts]) => (
            <Fragment key={blockchain}>
              {accounts.length > 0 && (
                <AccountSelection.Root blockchain={blockchain}>
                  {accounts.map(it => (
                    <AccountSelection.Item
                      key={`${it.address}-${it.blockchain}`}
                      address={it.address}
                      checked={actionData.selectedAccounts.some(AccountHelper.predicate(it))}
                      disabled={doesAccountExist(it)}
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
