import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbFileImport } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TAccountsToImport } from '@shared/@types/blockchain'

type TLocation = {
  mnemonicOrKey: string
}

export const ImportAccountsSelectionModal = () => {
  const { mnemonicOrKey } = useModalState<TLocation>()
  const blockchainActions = useBlockchainActions()
  const { t: commonT } = useTranslation('common')
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'importAccountsSelection' })
  const { doesAccountExist } = useAccountUtils()

  const { handleAct, isActing } = useLoadingActions()

  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const handleImport = async () => {
    const isMnemonic = UtilsHelper.isValidMnemonic(mnemonicOrKey)

    const wallet = blockchainActions.createWallet({
      name: isMnemonic ? commonT('wallet.mnemonicWalletName') : commonT('wallet.importedName'),
      mnemonic: isMnemonic ? mnemonicOrKey : undefined,
    })

    const accountsToImport: TAccountsToImport = selectedAccounts.map(({ address, blockchain, key }) => ({
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

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbFileImport />} contentClassName="flex flex-col min-h-0">
      <p className="text-sm text-center">{t('description')}</p>

      <MnemonicOrKeyAccountSelection
        className="mt-6 flex-grow mb-3"
        mnemonicOrKey={mnemonicOrKey}
        selectedAccounts={selectedAccounts}
        onSelect={setSelectedAccounts}
        onVerifyAccountExistence={doesAccountExist}
      />

      <Button
        className="w-full"
        type="button"
        onClick={handleAct(handleImport)}
        label={t('importButtonLabel')}
        leftIcon={<TbFileImport />}
        loading={isActing}
        disabled={selectedAccounts.length === 0}
        flat
      />
    </SideModalLayout>
  )
}
