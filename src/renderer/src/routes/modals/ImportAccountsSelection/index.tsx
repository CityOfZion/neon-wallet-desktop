import { useState } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import {
  MnemonicOrKeyAccountSelection,
  TMnemonicOrKeyAccountWithBlockchain,
} from '@renderer/components/MnemonicOrKeyAccountSelection'

import { AnalyticsHelper } from '@renderer/helpers/AnalyticsHelper'

import { useImportAccounts } from '@renderer/hooks/useAccountActions'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'

import { TAccountsToImport } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

const ImportAccountsSelectionModal = () => {
  const { mnemonicOrKey } = useModalState<TModalState<'import-accounts-selection'>>()
  const { createWallet } = useCreateWallet()
  const { importAccounts } = useImportAccounts()
  const { t: tCommon } = useTranslation('common')
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'importAccountsSelection' })
  const { doesAccountExist } = useAccountUtils()

  const [selectedAccounts, setSelectedAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])

  const [isImporting, startImport] = usePressOnce(async () => {
    const isMnemonic = BSKeychainHelper.isValidMnemonic(mnemonicOrKey)

    const wallet = createWallet({
      name: isMnemonic ? tCommon('wallet.mnemonicWalletName') : tCommon('wallet.importedName'),
      mnemonic: isMnemonic ? mnemonicOrKey : undefined,
    })

    const accountsToImport: TAccountsToImport = selectedAccounts.map(({ address, blockchain, key }) => ({
      address,
      blockchain,
      key,
      type: 'standard',
    }))

    const accounts = await importAccounts({
      accounts: accountsToImport,
      wallet,
    })

    AnalyticsHelper.logEvent('wallet_imported')

    modalErase()
    navigate('/wallets/overview', { state: { account: accounts[0] } })
  })

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbFileImport aria-hidden />}
      contentClassName="flex flex-col min-h-0"
      size="md"
    >
      <p className="text-center text-sm">{t('description')}</p>

      <MnemonicOrKeyAccountSelection
        className="mt-6 mb-3 grow"
        mnemonicOrKey={mnemonicOrKey}
        selectedAccounts={selectedAccounts}
        onSelect={setSelectedAccounts}
        onVerifyAccountExistence={doesAccountExist}
      />

      <Button
        className="w-full"
        type="button"
        onClick={startImport}
        label={t('importButtonLabel')}
        leftIcon={<TbFileImport aria-hidden />}
        loading={isImporting}
        disabled={selectedAccounts.length === 0}
        flat
      />
    </SideModalLayout>
  )
}

export default ImportAccountsSelectionModal
