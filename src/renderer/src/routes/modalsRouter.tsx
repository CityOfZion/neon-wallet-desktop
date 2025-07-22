import { TRoute } from '@shared/@types/modal'

import { AboutExtraIdToReceiveModal } from './modals/AboutExtraIdToReceiveModal'
import { AddAddressModal } from './modals/AddAddress'
import { AddCustomNetwork } from './modals/AddCustomNetwork'
import { AddNetworkProfileModal } from './modals/AddNetworkProfile'
import { AutoUpdateCompleted } from './modals/AutoUpdate/AutoUpdateCompleted'
import { AutoUpdateMobile } from './modals/AutoUpdate/AutoUpdateMobile'
import { AutoUpdateNotes } from './modals/AutoUpdate/AutoUpdateNotes'
import { BlockchainSelectionModal } from './modals/BlockchainSelection'
import { BuyAndSellTokensAboutDataModal } from './modals/BuyAndSellTokensAboutData'
import { BuyAndSellTokensLeaveAlertModal } from './modals/BuyAndSellTokensLeaveAlert'
import { ConfirmPasswordBackupModal } from './modals/ConfirmPasswordBackup'
import { ConfirmPasswordExportModal } from './modals/ConfirmPasswordExport'
import { ConfirmPasswordRecoverModal } from './modals/ConfirmPasswordRecover'
import { ConnectHardwareWalletModal } from './modals/ConnectHardwareWallet'
import { CreateWalletStep1Modal } from './modals/CreateWallet/CreateWalletStep1Modal'
import { CreateWalletStep2Modal } from './modals/CreateWallet/CreateWalletStep2Modal'
import { CreateWalletStep3Modal } from './modals/CreateWallet/CreateWalletStep3Modal'
import { CreateWalletStep4Modal } from './modals/CreateWallet/CreateWalletStep4Modal'
import { CreateWalletStep5Modal } from './modals/CreateWallet/CreateWalletStep5Modal'
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
import { ExportFullTransactionsModal } from './modals/ExportFullTransactions'
import { ExportKeyModal } from './modals/ExportKey'
import { ExportMnemonic } from './modals/ExportMnemonic'
import { ImportModal } from './modals/Import'
import { ImportAccountsSelectionModal } from './modals/Import/ImportAccountsSelectionModal'
import { ImportWatchAccountsModal } from './modals/Import/ImportWatchAccountsModal'
import { MigrateAccountsStep2Modal } from './modals/MigrateAccounts/MigrateAccountsStep2'
import { MigrateAccountsStep3Modal } from './modals/MigrateAccounts/MigrateAccountsStep3'
import { MigrateAccountsStep4Modal } from './modals/MigrateAccounts/MigrateAccountsStep4'
import { MigrationNeo3StatusModal } from './modals/MigrationNeo3Status'
import { NetworkNodeSelection } from './modals/NetworkNodeSelection'
import { NetworkSelection } from './modals/NetworkSelection'
import { NFTSelectionModal } from './modals/NftSelection'
import { NotificationsModal } from './modals/Notifications'
import { PersistAccountModal } from './modals/PersistAccount'
import { PersistContactModal } from './modals/PersistContact'
import { DeleteModal } from './modals/PersistContact/DeleteModal'
import { PrepareHardwareWalletMigrationNeo3Modal } from './modals/PrepareHardwareWalletMigrationNeo3'
import { SearchModal } from './modals/Search'
import { SelectAccountModal } from './modals/SelectAccount'
import { SelectContact } from './modals/SelectContact'
import { SellTokensDepositModal } from './modals/SellTokensDeposit/SellTokensDepositModal'
import { SuccessModal } from './modals/Success'
import { SwapDetailsModal } from './modals/SwapDetails'
import { SwapDetailsLogModal } from './modals/SwapDetailsLog'
import { VoteNeo3CandidateDetailsModal } from './modals/VoteNeo3CandidateDetails'
import { VoteNeo3ConfirmationModal } from './modals/VoteNeo3Confirmation'
import { VoteNeo3SuccessModal } from './modals/VoteNeo3Success'
import { VoteNeo3SupportUsModal } from './modals/VoteNeo3SupportUs'

export const modalsRouter: TRoute[] = [
  { name: 'import', type: 'side', element: <ImportModal /> },
  { name: 'import-accounts-selection', type: 'side', element: <ImportAccountsSelectionModal /> },
  { name: 'import-watch-accounts', type: 'side', element: <ImportWatchAccountsModal /> },
  { name: 'confirm-password-backup', type: 'side', element: <ConfirmPasswordBackupModal /> },
  { name: 'edit-wallet', type: 'side', element: <EditWalletModal /> },
  { name: 'confirm-password-recover', type: 'side', element: <ConfirmPasswordRecoverModal /> },
  { name: 'persist-account', type: 'side', element: <PersistAccountModal /> },
  { name: 'delete-account', type: 'side', size: 'md', element: <DeleteAccountModal /> },
  { name: 'export-key', type: 'side', size: 'md', element: <ExportKeyModal /> },
  { name: 'export-mnemonic', type: 'side', size: 'md', element: <ExportMnemonic /> },
  { name: 'confirm-password-export', type: 'side', element: <ConfirmPasswordExportModal /> },
  { name: 'delete-wallet', type: 'side', size: 'md', element: <DeleteWalletModal /> },
  { name: 'create-wallet-step-1', type: 'side', size: '1xl', element: <CreateWalletStep1Modal /> },
  { name: 'create-wallet-step-2', type: 'side', size: '1xl', element: <CreateWalletStep2Modal /> },
  { name: 'create-wallet-step-3', type: 'side', size: '1xl', element: <CreateWalletStep3Modal /> },
  { name: 'create-wallet-step-4', type: 'side', size: '1xl', element: <CreateWalletStep4Modal /> },
  { name: 'create-wallet-step-5', type: 'side', size: '1xl', element: <CreateWalletStep5Modal /> },
  { name: 'persist-contact', type: 'side', element: <PersistContactModal /> },
  { name: 'delete-contact', type: 'side', element: <DeleteModal /> },
  { name: 'add-address', type: 'side', element: <AddAddressModal /> },
  { name: 'success', type: 'side', size: 'md', element: <SuccessModal /> },
  { name: 'error', type: 'side', size: 'md', element: <ErrorModal /> },
  { name: 'dapp-disconnection', type: 'side', element: <DappDisconnectionModal /> },
  { name: 'dapp-connection', type: 'center', size: 'sm', element: <DappConnectionModal /> },
  { name: 'dapp-connection-details', type: 'center', size: 'sm', element: <DappConnectionDetailsModal /> },
  { name: 'dapp-permission', type: 'center', size: 'sm', element: <DappPermissionModal /> },
  {
    name: 'dapp-permission-contract-details',
    type: 'center',
    size: 'sm',
    element: <DappPermissionContractDetailsModal />,
  },
  {
    name: 'dapp-permission-signature-scope',
    type: 'center',
    size: 'sm',
    element: <DappPermissionSignatureScopeModal />,
  },
  { name: 'select-contact', type: 'side', element: <SelectContact /> },
  { name: 'blockchain-selection', type: 'side', element: <BlockchainSelectionModal /> },
  { name: 'decrypt-key', type: 'side', element: <DecryptKeyModal /> },
  { name: 'select-account', type: 'side', element: <SelectAccountModal /> },
  { name: 'network-selection', type: 'side', element: <NetworkSelection /> },
  { name: 'migrate-accounts-step-2', type: 'side', size: 'xl', element: <MigrateAccountsStep2Modal /> },
  { name: 'migrate-accounts-step-3', type: 'side', size: 'xl', element: <MigrateAccountsStep3Modal /> },
  { name: 'migrate-accounts-step-4', type: 'side', size: 'xl', element: <MigrateAccountsStep4Modal /> },
  { name: 'auto-update-completed', type: 'center', size: 'lg', element: <AutoUpdateCompleted /> },
  { name: 'auto-update-mobile', type: 'center', size: 'lg', element: <AutoUpdateMobile /> },
  { name: 'auto-update-notes', type: 'center', size: 'lg', element: <AutoUpdateNotes /> },
  { name: 'network-node-selection', type: 'side', element: <NetworkNodeSelection /> },
  { name: 'add-custom-network', type: 'side', element: <AddCustomNetwork /> },
  { name: 'add-network-profile', type: 'side', element: <AddNetworkProfileModal /> },
  { name: 'nft-selection', type: 'side', element: <NFTSelectionModal /> },
  { name: 'connect-hardware-wallet', type: 'center', size: 'lg', element: <ConnectHardwareWalletModal /> },
  { name: 'swap-details', type: 'side', size: 'lg', element: <SwapDetailsModal /> },
  { name: 'swap-details-log', type: 'side', size: 'lg', element: <SwapDetailsLogModal /> },
  { name: 'about-extra-id-to-receive', type: 'side', size: 'sm', element: <AboutExtraIdToReceiveModal /> },
  { name: 'sell-tokens-deposit', type: 'side', size: 'lg', element: <SellTokensDepositModal /> },
  {
    name: 'buy-and-sell-tokens-leave-alert',
    type: 'center',
    size: 'xs',
    element: <BuyAndSellTokensLeaveAlertModal />,
  },
  {
    name: 'buy-and-sell-tokens-about-data',
    type: 'side',
    size: 'sm',
    element: <BuyAndSellTokensAboutDataModal />,
  },
  { name: 'notifications', type: 'side', size: 'sm', element: <NotificationsModal /> },
  {
    name: 'prepare-hardware-wallet-migration-neo3',
    type: 'center',
    size: 'lg',
    element: <PrepareHardwareWalletMigrationNeo3Modal />,
  },
  { name: 'migration-neo3-status', type: 'side', size: 'md', element: <MigrationNeo3StatusModal /> },
  { name: 'search', type: 'center', size: 'sm', element: <SearchModal />, closeOnEsc: true, closeOnClickOutside: true },
  { name: 'export-full-transactions', type: 'center', size: 'sm', element: <ExportFullTransactionsModal /> },
  {
    name: 'vote-neo3-support-us',
    type: 'center',
    size: 'sm',
    closeOnEsc: true,
    closeOnClickOutside: true,
    element: <VoteNeo3SupportUsModal />,
  },
  {
    name: 'vote-neo3-candidate-details',
    type: 'side',
    size: 'sm',
    element: <VoteNeo3CandidateDetailsModal />,
  },
  {
    name: 'vote-neo3-confirmation',
    type: 'center',
    size: 'sm',
    element: <VoteNeo3ConfirmationModal />,
  },
  {
    name: 'vote-neo3-success',
    type: 'center',
    size: 'sm',
    element: <VoteNeo3SuccessModal />,
  },
]
