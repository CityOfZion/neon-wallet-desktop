import { TRoute } from '@renderer/@types/modal'

import { AddAddressModal } from './modals/AddAddress'
import { AddWatch } from './modals/AddWatch'
import { AutoUpdateCompleted } from './modals/AutoUpdate/AutoUpdateCompleted'
import { AutoUpdateMobile } from './modals/AutoUpdate/AutoUpdateMobile'
import { AutoUpdateNotes } from './modals/AutoUpdate/AutoUpdateNotes'
import { BlockchainSelectionModal } from './modals/BlockchainSelection'
import { ConfirmPasswordBackupModal } from './modals/ConfirmPasswordBackup'
import { ConfirmPasswordRecoverModal } from './modals/ConfirmPasswordRecover'
import { CreateWalletStep1Modal } from './modals/CreateWallet/CreateWalletStep1Modal'
import { CreateWalletStep2Modal } from './modals/CreateWallet/CreateWalletStep2Modal'
import { CreateWalletStep3Modal } from './modals/CreateWallet/CreateWalletStep3Modal'
import { CreateWalletStep4Modal } from './modals/CreateWallet/CreateWalletStep4Modal'
import { DappConnectionModal } from './modals/DappConnection'
import { DappConnectionDetailsModal } from './modals/DappConnectionDetails'
import { DappDisconnectionModal } from './modals/DappDisconnection'
import { DappPermissionModal } from './modals/DappPermission'
import { DappPermissionContractDetailsModal } from './modals/DappPermissionContractDetails'
import { DappPermissionSignatureScopeModal } from './modals/DappPermissionSignatureScope'
import { DecryptKeyModal } from './modals/DecryptKeyModal'
import { DeleteAccountModal } from './modals/DeleteAccount'
import { DeleteWalletModal } from './modals/DeleteWallet'
import { EditWalletModal } from './modals/EditWallet'
import { ErrorModal } from './modals/Error'
import { ImportModal } from './modals/Import'
import { ImportKeyAccountsSelectionModal } from './modals/Import/ImportKeyAccountsSelectionModal'
import { ImportMnemonicAccountsSelectionModal } from './modals/Import/ImportMnemonicAccountsSelectionModal'
import { InputAmount } from './modals/InputAmount'
import { MigrateAccountsStep2Modal } from './modals/MigrateAccounts/MigrateAccountsStep2'
import { MigrateAccountsStep3Modal } from './modals/MigrateAccounts/MigrateAccountsStep3'
import { MigrateAccountsStep4Modal } from './modals/MigrateAccounts/MigrateAccountsStep4'
import { NetworkNodeSelection } from './modals/NetworkNodeSelection'
import { NetworkSelection } from './modals/NetworkSelection'
import { PersistAccountModal } from './modals/PersistAccount'
import { PersistContactModal } from './modals/PersistContact'
import { DeleteModal } from './modals/PersistContact/DeleteModal'
import { SelectAccount } from './modals/SelectAccount'
import { SelectContact } from './modals/SelectContact'
import { SelectToken } from './modals/SelectToken'
import { SuccessModal } from './modals/Success'

export const modalsRouter: TRoute[] = [
  { name: 'import', type: 'side', element: <ImportModal /> },
  { name: 'import-mnemonic-accounts-selection', type: 'side', element: <ImportMnemonicAccountsSelectionModal /> },
  { name: 'import-key-accounts-selection', type: 'side', element: <ImportKeyAccountsSelectionModal /> },
  { name: 'confirm-password-backup', type: 'side', element: <ConfirmPasswordBackupModal /> },
  { name: 'add-watch', type: 'side', element: <AddWatch /> },
  { name: 'edit-wallet', type: 'side', element: <EditWalletModal /> },
  { name: 'confirm-password-recover', type: 'side', element: <ConfirmPasswordRecoverModal /> },
  { name: 'persist-account', type: 'side', element: <PersistAccountModal /> },
  { name: 'delete-account', type: 'side', size: 'md', element: <DeleteAccountModal /> },
  { name: 'delete-wallet', type: 'side', size: 'md', element: <DeleteWalletModal /> },
  { name: 'create-wallet-step-1', type: 'side', size: 'xl', element: <CreateWalletStep1Modal /> },
  { name: 'create-wallet-step-2', type: 'side', size: 'xl', element: <CreateWalletStep2Modal /> },
  { name: 'create-wallet-step-3', type: 'side', size: 'xl', element: <CreateWalletStep3Modal /> },
  { name: 'create-wallet-step-4', type: 'side', size: 'xl', element: <CreateWalletStep4Modal /> },
  { name: 'persist-contact', type: 'side', element: <PersistContactModal /> },
  { name: 'delete-contact', type: 'side', element: <DeleteModal /> },
  { name: 'add-address', type: 'side', element: <AddAddressModal /> },
  { name: 'success', type: 'side', size: 'md', element: <SuccessModal /> },
  { name: 'error', type: 'side', size: 'md', element: <ErrorModal /> },
  { name: 'dapp-disconnection', type: 'side', element: <DappDisconnectionModal /> },
  { name: 'dapp-connection', type: 'center', element: <DappConnectionModal /> },
  { name: 'dapp-connection-details', type: 'center', element: <DappConnectionDetailsModal /> },
  { name: 'dapp-permission', type: 'center', element: <DappPermissionModal /> },
  {
    name: 'dapp-permission-contract-details',
    type: 'center',
    element: <DappPermissionContractDetailsModal />,
  },
  { name: 'dapp-permission-signature-scope', type: 'center', element: <DappPermissionSignatureScopeModal /> },
  { name: 'select-contact', type: 'side', element: <SelectContact /> },
  { name: 'blockchain-selection', type: 'side', element: <BlockchainSelectionModal /> },
  { name: 'decrypt-key', type: 'side', element: <DecryptKeyModal /> },
  { name: 'select-account', type: 'side', element: <SelectAccount /> },
  { name: 'select-token', type: 'side', size: 'md', element: <SelectToken /> },
  { name: 'input-amount', type: 'side', element: <InputAmount /> },
  { name: 'network-selection', type: 'side', element: <NetworkSelection /> },
  { name: 'migrate-accounts-step-2', type: 'side', size: 'lg', element: <MigrateAccountsStep2Modal /> },
  { name: 'migrate-accounts-step-3', type: 'side', size: 'lg', element: <MigrateAccountsStep3Modal /> },
  { name: 'migrate-accounts-step-4', type: 'side', size: 'lg', element: <MigrateAccountsStep4Modal /> },
  { name: 'auto-update-completed', type: 'center', size: 'lg', element: <AutoUpdateCompleted /> },
  { name: 'auto-update-mobile', type: 'center', size: 'lg', element: <AutoUpdateMobile /> },
  { name: 'auto-update-notes', type: 'center', size: 'lg', element: <AutoUpdateNotes /> },
  { name: 'network-node-selection', type: 'side', element: <NetworkNodeSelection /> },
]
