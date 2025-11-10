import { lazy } from 'react'

import { TRoute } from '@shared/types/modal'

const AboutExtraIdToReceiveModal = lazy(() => import('./modals/AboutExtraIdToReceiveModal'))
const AddAddressModal = lazy(() => import('./modals/AddAddress'))
const AddCustomNetwork = lazy(() => import('./modals/AddCustomNetwork'))
const AddNetworkProfileModal = lazy(() => import('./modals/AddNetworkProfile'))
const AutoUpdateCompleted = lazy(() => import('./modals/AutoUpdate/AutoUpdateCompleted'))
const AutoUpdateMobile = lazy(() => import('./modals/AutoUpdate/AutoUpdateMobile'))
const AutoUpdateNotes = lazy(() => import('./modals/AutoUpdate/AutoUpdateNotes'))
const BlockchainSelectionModal = lazy(() => import('./modals/BlockchainSelection'))
const BuyAndSellTokensAboutDataModal = lazy(() => import('./modals/BuyAndSellTokensAboutData'))
const BuyAndSellTokensLeaveAlertModal = lazy(() => import('./modals/BuyAndSellTokensLeaveAlert'))
const ConfirmPasswordBackupModal = lazy(() => import('./modals/ConfirmPasswordBackup'))
const ConfirmPasswordExportModal = lazy(() => import('./modals/ConfirmPasswordExport'))
const ConfirmPasswordRecoverModal = lazy(() => import('./modals/ConfirmPasswordRecover'))
const ConnectHardwareWalletModal = lazy(() => import('./modals/ConnectHardwareWallet'))
const CreateWalletStep1Modal = lazy(() => import('./modals/CreateWallet/CreateWalletStep1Modal'))
const CreateWalletStep2Modal = lazy(() => import('./modals/CreateWallet/CreateWalletStep2Modal'))
const CreateWalletStep3Modal = lazy(() => import('./modals/CreateWallet/CreateWalletStep3Modal'))
const CreateWalletStep4Modal = lazy(() => import('./modals/CreateWallet/CreateWalletStep4Modal'))
const CreateWalletStep5Modal = lazy(() => import('./modals/CreateWallet/CreateWalletStep5Modal'))
const DappConnectionModal = lazy(() => import('./modals/DappConnection'))
const DappConnectionDetailsModal = lazy(() => import('./modals/DappConnectionDetails'))
const DappDisconnectionModal = lazy(() => import('./modals/DappDisconnection'))
const DappPermissionModal = lazy(() => import('./modals/DappPermission'))
const DappPermissionContractDetailsModal = lazy(() => import('./modals/DappPermissionContractDetails'))
const DappPermissionSignatureScopeModal = lazy(() => import('./modals/DappPermissionSignatureScope'))
const DecryptKeyModal = lazy(() => import('./modals/DecryptKeyModal'))
const DeleteAccountModal = lazy(() => import('./modals/DeleteAccount'))
const DeleteWalletModal = lazy(() => import('./modals/DeleteWallet'))
const EditWalletModal = lazy(() => import('./modals/EditWallet'))
const ErrorModal = lazy(() => import('./modals/Error'))
const ExportFullTransactionsModal = lazy(() => import('./modals/ExportFullTransactions'))
const ExportKeyModal = lazy(() => import('./modals/ExportKey'))
const ExportMnemonic = lazy(() => import('./modals/ExportMnemonic'))
const HideFraudulentTokenModal = lazy(() => import('./modals/HideFraudulentToken'))
const ImportModal = lazy(() => import('./modals/Import'))
const ImportAccountsSelectionModal = lazy(() => import('./modals/Import/ImportAccountsSelectionModal'))
const ImportWatchAccountsModal = lazy(() => import('./modals/Import/ImportWatchAccountsModal'))
const MigrateAccountsStep2Modal = lazy(() => import('./modals/MigrateAccounts/MigrateAccountsStep2'))
const MigrateAccountsStep3Modal = lazy(() => import('./modals/MigrateAccounts/MigrateAccountsStep3'))
const MigrateAccountsStep4Modal = lazy(() => import('./modals/MigrateAccounts/MigrateAccountsStep4'))
const Neo3NeoxBridgeConfirmationModal = lazy(() => import('./modals/Neo3NeoxBridgeConfirmation'))
const Neo3NeoxBridgeDetailsModal = lazy(() => import('./modals/Neo3NeoxBridgeDetails'))
const NetworkNodeSelection = lazy(() => import('./modals/NetworkNodeSelection'))
const NetworkSelection = lazy(() => import('./modals/NetworkSelection'))
const NFTSelectionModal = lazy(() => import('./modals/NftSelection'))
const NotificationsModal = lazy(() => import('./modals/Notifications'))
const PersistAccountModal = lazy(() => import('./modals/PersistAccount'))
const PersistContactModal = lazy(() => import('./modals/PersistContact'))
const DeleteModal = lazy(() => import('./modals/PersistContact/DeleteModal'))
const SearchModal = lazy(() => import('./modals/Search'))
const SelectAccountModal = lazy(() => import('./modals/SelectAccount'))
const SelectContact = lazy(() => import('./modals/SelectContact'))
const SellTokensDepositModal = lazy(() => import('./modals/SellTokensDeposit/SellTokensDepositModal'))
const SuccessModal = lazy(() => import('./modals/Success'))
const SwapDetailsModal = lazy(() => import('./modals/SwapDetails'))
const SwapDetailsLogModal = lazy(() => import('./modals/SwapDetailsLog'))
const VoteNeo3CandidateDetailsModal = lazy(() => import('./modals/VoteNeo3CandidateDetails'))
const VoteNeo3ConfirmationModal = lazy(() => import('./modals/VoteNeo3Confirmation'))
const VoteNeo3SuccessModal = lazy(() => import('./modals/VoteNeo3Success'))
const VoteNeo3SupportUsModal = lazy(() => import('./modals/VoteNeo3SupportUs'))

export const modalsRouter: TRoute[] = [
  { name: 'import', type: 'side', element: ImportModal },
  { name: 'import-accounts-selection', type: 'side', size: 'md', element: ImportAccountsSelectionModal },
  { name: 'import-watch-accounts', type: 'side', size: 'md', element: ImportWatchAccountsModal },
  { name: 'confirm-password-backup', type: 'side', element: ConfirmPasswordBackupModal },
  { name: 'edit-wallet', type: 'side', element: EditWalletModal },
  { name: 'confirm-password-recover', type: 'side', element: ConfirmPasswordRecoverModal },
  { name: 'persist-account', type: 'side', element: PersistAccountModal },
  { name: 'delete-account', type: 'side', size: 'md', element: DeleteAccountModal },
  { name: 'export-key', type: 'side', size: 'md', element: ExportKeyModal },
  { name: 'export-mnemonic', type: 'side', size: 'md', element: ExportMnemonic },
  { name: 'confirm-password-export', type: 'side', element: ConfirmPasswordExportModal },
  { name: 'delete-wallet', type: 'side', size: 'md', element: DeleteWalletModal },
  { name: 'create-wallet-step-1', type: 'side', size: '1xl', element: CreateWalletStep1Modal },
  { name: 'create-wallet-step-2', type: 'side', size: '1xl', element: CreateWalletStep2Modal },
  { name: 'create-wallet-step-3', type: 'side', size: '1xl', element: CreateWalletStep3Modal },
  { name: 'create-wallet-step-4', type: 'side', size: '1xl', element: CreateWalletStep4Modal },
  { name: 'create-wallet-step-5', type: 'side', size: '1xl', element: CreateWalletStep5Modal },
  { name: 'persist-contact', type: 'side', element: PersistContactModal },
  { name: 'delete-contact', type: 'side', element: DeleteModal },
  { name: 'add-address', type: 'side', element: AddAddressModal },
  { name: 'success', type: 'side', size: 'md', element: SuccessModal },
  { name: 'error', type: 'side', size: 'md', element: ErrorModal },
  { name: 'dapp-disconnection', type: 'side', element: DappDisconnectionModal },
  { name: 'dapp-connection', type: 'center', size: 'sm', element: DappConnectionModal },
  { name: 'dapp-connection-details', type: 'center', size: 'sm', element: DappConnectionDetailsModal },
  { name: 'dapp-permission', type: 'center', size: 'sm', element: DappPermissionModal },
  {
    name: 'dapp-permission-contract-details',
    type: 'center',
    size: 'sm',
    element: DappPermissionContractDetailsModal,
  },
  {
    name: 'dapp-permission-signature-scope',
    type: 'center',
    size: 'sm',
    element: DappPermissionSignatureScopeModal,
  },
  { name: 'select-contact', type: 'side', element: SelectContact },
  { name: 'blockchain-selection', type: 'side', element: BlockchainSelectionModal },
  { name: 'decrypt-key', type: 'side', element: DecryptKeyModal },
  { name: 'select-account', type: 'side', element: SelectAccountModal },
  { name: 'network-selection', type: 'side', element: NetworkSelection },
  { name: 'migrate-accounts-step-2', type: 'side', size: 'xl', element: MigrateAccountsStep2Modal },
  { name: 'migrate-accounts-step-3', type: 'side', size: 'xl', element: MigrateAccountsStep3Modal },
  { name: 'migrate-accounts-step-4', type: 'side', size: 'xl', element: MigrateAccountsStep4Modal },
  { name: 'auto-update-completed', type: 'center', size: 'lg', element: AutoUpdateCompleted },
  { name: 'auto-update-mobile', type: 'center', size: 'lg', element: AutoUpdateMobile },
  { name: 'auto-update-notes', type: 'center', size: 'lg', element: AutoUpdateNotes },
  { name: 'network-node-selection', type: 'side', element: NetworkNodeSelection },
  { name: 'add-custom-network', type: 'side', element: AddCustomNetwork },
  { name: 'add-network-profile', type: 'side', element: AddNetworkProfileModal },
  { name: 'nft-selection', type: 'side', element: NFTSelectionModal },
  { name: 'connect-hardware-wallet', type: 'center', size: 'lg', element: ConnectHardwareWalletModal },
  { name: 'swap-details', type: 'side', size: 'lg', element: SwapDetailsModal },
  { name: 'swap-details-log', type: 'side', size: 'lg', element: SwapDetailsLogModal },
  { name: 'about-extra-id-to-receive', type: 'side', size: 'sm', element: AboutExtraIdToReceiveModal },
  { name: 'sell-tokens-deposit', type: 'side', size: 'lg', element: SellTokensDepositModal },
  {
    name: 'buy-and-sell-tokens-leave-alert',
    type: 'center',
    size: 'xs',
    element: BuyAndSellTokensLeaveAlertModal,
  },
  {
    name: 'buy-and-sell-tokens-about-data',
    type: 'side',
    size: 'sm',
    element: BuyAndSellTokensAboutDataModal,
  },
  { name: 'notifications', type: 'side', size: 'sm', element: NotificationsModal },
  { name: 'search', type: 'center', size: 'sm', element: SearchModal, closeOnEsc: true, closeOnClickOutside: true },
  { name: 'export-full-transactions', type: 'center', size: 'sm', element: ExportFullTransactionsModal },
  {
    name: 'vote-neo3-support-us',
    type: 'center',
    size: 'sm',
    closeOnEsc: true,
    closeOnClickOutside: true,
    element: VoteNeo3SupportUsModal,
  },
  {
    name: 'vote-neo3-candidate-details',
    type: 'side',
    size: 'sm',
    element: VoteNeo3CandidateDetailsModal,
  },
  {
    name: 'vote-neo3-confirmation',
    type: 'center',
    size: 'sm',
    closeOnEsc: true,
    closeOnClickOutside: true,
    element: VoteNeo3ConfirmationModal,
  },
  {
    name: 'vote-neo3-success',
    type: 'center',
    size: 'sm',
    element: VoteNeo3SuccessModal,
  },
  {
    name: 'hide-fraudulent-token',
    type: 'center',
    size: 'xs',
    element: HideFraudulentTokenModal,
  },
  {
    name: 'neo3-neox-bridge-confirmation',
    type: 'side',
    size: 'lg',
    element: Neo3NeoxBridgeConfirmationModal,
  },
  {
    name: 'neo3-neox-bridge-details',
    type: 'side',
    size: 'lg',
    element: Neo3NeoxBridgeDetailsModal,
  },
]
