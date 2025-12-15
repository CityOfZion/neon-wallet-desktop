import type { IBlockchainService, TBridgeToken, TNftResponse } from '@cityofzion/blockchain-service'
import type { TWalletKitHelperSessionDetails } from '@cityofzion/bs-multichain'
import type { TVoteServiceCandidate } from '@cityofzion/bs-neo3'
import type { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import type { PendingRequestTypes, ProposalTypes, SessionTypes } from '@walletconnect/types'
import type { Dispatch, JSX } from 'react'

import type { TBlockchainServiceKey, TNetwork } from './blockchain'
import type {
  TUseNeonBackupData,
  TUseNeonBackupDeprecatedData,
  TUseNeonBackupGeneratedData,
  TUseNeonMigrateAccountsSchema,
  TUseNeonMigrateGeneratedData,
  TUseNeonMigrateParsedContent,
} from './hooks'
import type { TTokenBalance } from './query'
import type { IAccountState, IContactState, IWalletState, TContactAddress, TNetworkProfile, TSwapRecord } from './store'

type TAddAddressModalState = {
  contactName: string
  address?: TContactAddress
  index?: number
  handleAddAddress: (contactAddress: TContactAddress, index?: number) => void
}

type TAddCustomNetworkModalState = {
  blockchain: TBlockchainServiceKey
  network?: TNetwork
}

type TAddNetworkProfileModalState = {
  profile: TNetworkProfile
}

type TBlockchainSelectionModalState = {
  heading: string
  headingIcon?: JSX.Element
  description?: string
  subtitle?: string
  buttonLabel?: string
  withBackButton?: boolean
  onSelect?: (blockchain: TBlockchainServiceKey) => void | Promise<void>
}

type TConfirmActionModalState = {
  onSuccess: () => void
  onCancel: () => void
}

type TConfirmPasswordBackupModalState = {
  selectedFilePath: string
}

type TConfirmPasswordExportModalState = {
  title: string
  icon: JSX.Element
  onSubmitPassword: () => void
}

type TConfirmPasswordRecoverModalState = {
  data: TUseNeonBackupData | TUseNeonBackupDeprecatedData
  onDecrypt?: (data: TUseNeonBackupGeneratedData) => void
}

type TCreateWalletStep2ModalState = {
  words: string[]
}

type TCreateWalletStep3ModalState = {
  words: string[]
}

type TCreateWalletStep4ModalState = {
  nameTrimmed: string
  words: string[]
}

type TCreateWalletStep5ModalState = {
  accounts: IAccountState[]
}

type TDappDisconnectionModalState = {
  sessions: SessionTypes.Struct[]
}

type TDecryptKeyModalState = {
  encryptedKey: string
  blockchain: TBlockchainServiceKey
  onDecrypt?: (key: string, address: string) => Promise<void> | void
}

type TDeleteAccountModalState = {
  account: IAccountState
}

type TDeleteContactModalState = {
  modalTitle: string
  warningText: string
  warningDescription?: string
  firstName: string
  secondName?: string
  onButtonClick: () => void
  buttonLabel: string
  truncateFirstName?: boolean
}

type TDeleteWalletModalState = {
  wallet: IWalletState
}

type TEditWalletModalState = {
  wallet: IWalletState
}

type TErrorModalState = {
  heading: string
  headingIcon?: JSX.Element
  subtitle?: string
  description?: string
  content: JSX.Element
}

type TExportKeyModalState = {
  account: IAccountState
}

type TExportMnemonicModalState = {
  wallet: IWalletState
}

type TImportModalState =
  | {
      text: string
    }
  | undefined

type TImportAccountsSelectionModalState = {
  mnemonicOrKey: string
}

type TImportWatchAccountsModalState =
  | {
      address: string
    }
  | undefined

type TMigrateAccountsStep3ModalState = {
  content: TUseNeonMigrateParsedContent
  onDecrypt?: (generatedData: TUseNeonMigrateGeneratedData) => void
}

type TMigrateAccountsStep4ModalState = {
  selectedAccountsToMigrate: TUseNeonMigrateAccountsSchema[]
  content: TUseNeonMigrateParsedContent
  onDecrypt?: (generatedData: TUseNeonMigrateGeneratedData) => void
}

type TNeo3NeoxBridgeConfirmationModalState = {
  onConfirm(): Promise<void>
  tokenToUse: TBridgeToken<TBlockchainServiceKey>
  tokenToReceive: TBridgeToken<TBlockchainServiceKey>
  accountToUse: IAccountState
  amountToUse: string
  amountToReceive: string
  addressToReceive: string
  bridgeFee: string
  fromService: IBlockchainService<TBlockchainServiceKey>
}

type TNeo3NeoxBridgeDetailsModalState = {
  tokenToUse: TBridgeToken<TBlockchainServiceKey>
  tokenToReceive: TBridgeToken<TBlockchainServiceKey>
  accountToUse: IAccountState
  amountToUse: string
  amountToReceive: string
  addressToReceive: string
  transactionHash?: string
  confirmed?: boolean
}

type TNetworkNodeSelectionModalState = {
  blockchain: TBlockchainServiceKey
}

type TNetworkSelectionModalState = {
  blockchain: TBlockchainServiceKey
}

type TNftSelectionModalState = {
  account: IAccountState
  onSelect: (nft: TNftResponse) => void
}

type TPersistAccountModalState =
  | {
      account?: IAccountState
      wallet?: IWalletState
    }
  | undefined

type TPersistContactModalState =
  | {
      contact?: IContactState
      addresses?: TContactAddress[]
    }
  | undefined

type TSelectAccountModalState = {
  onSelectAccount: (contact: IAccountState) => void
  title?: string
  buttonLabel?: string
  leftIcon?: JSX.Element
  blockchain?: TBlockchainServiceKey
}

type TSelectContactModalState = {
  blockchain?: TBlockchainServiceKey
  onSelectContact: (address: TContactAddress) => void
}

type TDepositActionsData = {
  amount: string
  isAmountLoading: boolean
  address: string
  isFeeLoading: boolean
  fee?: string
  token?: TTokenBalance
  account?: IAccountState
}

type TSellTokensDepositModalState = {
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  account?: IAccountState
}

type TSuccessModalState = {
  heading: string
  headingIcon?: JSX.Element
  subtitle?: string
  content?: JSX.Element
  footer?: JSX.Element
}

type TSwapDetailsModalState = {
  swapRecord: TSwapRecord
}

type TSwapDetailsLogModalState = {
  swapRecord: TSwapRecord
}

type TVoteNeo3CandidateDetailsModalState = {
  neo3Account: IAccountState
  candidate: TVoteServiceCandidate
  candidateVotePercentage: string
}

type TModalRouterSideRouteTypes = {
  'about-extra-id-to-receive': undefined
  'add-address': TAddAddressModalState
  'add-custom-network': TAddCustomNetworkModalState
  'add-network-profile': TAddNetworkProfileModalState | undefined
  'blockchain-selection': TBlockchainSelectionModalState
  'buy-and-sell-tokens-about-data': undefined
  'confirm-action': TConfirmActionModalState
  'confirm-password-backup': TConfirmPasswordBackupModalState
  'confirm-password-export': TConfirmPasswordExportModalState
  'confirm-password-recover': TConfirmPasswordRecoverModalState
  'create-wallet-step-1': undefined
  'create-wallet-step-2': TCreateWalletStep2ModalState
  'create-wallet-step-3': TCreateWalletStep3ModalState
  'create-wallet-step-4': TCreateWalletStep4ModalState
  'create-wallet-step-5': TCreateWalletStep5ModalState
  'dapp-disconnection': TDappDisconnectionModalState
  'decrypt-key': TDecryptKeyModalState
  'delete-account': TDeleteAccountModalState
  'delete-contact': TDeleteContactModalState
  'delete-wallet': TDeleteWalletModalState
  'edit-wallet': TEditWalletModalState
  error: TErrorModalState
  'export-key': TExportKeyModalState
  'export-mnemonic': TExportMnemonicModalState
  import: TImportModalState
  'import-accounts-selection': TImportAccountsSelectionModalState
  'import-watch-accounts': TImportWatchAccountsModalState
  'migrate-accounts-step-2': undefined
  'migrate-accounts-step-3': TMigrateAccountsStep3ModalState
  'migrate-accounts-step-4': TMigrateAccountsStep4ModalState
  'neo3-neox-bridge-confirmation': TNeo3NeoxBridgeConfirmationModalState
  'neo3-neox-bridge-details': TNeo3NeoxBridgeDetailsModalState
  'network-node-selection': TNetworkNodeSelectionModalState
  'network-selection': TNetworkSelectionModalState
  'nft-selection': TNftSelectionModalState
  notifications: undefined
  'persist-account': TPersistAccountModalState
  'persist-contact': TPersistContactModalState
  'select-account': TSelectAccountModalState
  'select-contact': TSelectContactModalState
  'sell-tokens-deposit': TSellTokensDepositModalState
  success: TSuccessModalState
  'swap-details': TSwapDetailsModalState
  'swap-details-log': TSwapDetailsLogModalState
  'vote-neo3-candidate-details': TVoteNeo3CandidateDetailsModalState
}

type TBuyAndSellTokensLeaveAlertModalState = {
  nextUrl: string
  setCanNavigate: (canNavigate: boolean) => void
}

type TDappConnectionModalState = {
  account: IAccountState
  uri?: string
}

type TDappConnectionRequestModalState = {
  proposal: ProposalTypes.Struct
  account: IAccountState
}

type TDappPermissionContractDetailsModalState = {
  session: SessionTypes.Struct
  hash: string
  operation: string
  blockchain: TBlockchainServiceKey
  values: any[]
}

type TDappPermissionModalState = {
  session: SessionTypes.Struct
  request: PendingRequestTypes.Struct
  sessionDetails: TWalletKitHelperSessionDetails<TBlockchainServiceKey>
  sessionAccount: IAccountState
  onReject: (reason?: ErrorResponse) => Promise<void>
  onAccept: () => Promise<any>
}

type TDappPermissionSignatureScopeModalState = {
  session: SessionTypes.Struct
  scope: string
  allowedList?: string[]
}

type TExportFullTransactionsModalState =
  | {
      account: IAccountState
    }
  | undefined

type THideFraudulentTokenModalState = {
  account: IAccountState
  hash: string
}

type TVoteNeo3ConfirmationModalState = {
  neo3Account: IAccountState
  candidate: TVoteServiceCandidate
}

type TVoteNeo3SuccessModalState = {
  neo3Account: IAccountState
  candidate: TVoteServiceCandidate
}

type TVoteNeo3SupportUsModalState = {
  neo3Account: IAccountState
  cozCandidate: TVoteServiceCandidate
}

type TModalRouterCenterRouteTypes = {
  'auto-update-completed': undefined
  'auto-update-mobile': undefined
  'auto-update-notes': undefined
  'buy-and-sell-tokens-leave-alert': TBuyAndSellTokensLeaveAlertModalState
  'connect-hardware-wallet': undefined
  'dapp-connection': TDappConnectionModalState
  'dapp-connection-request': TDappConnectionRequestModalState
  'dapp-permission': TDappPermissionModalState
  'dapp-permission-contract-details': TDappPermissionContractDetailsModalState
  'dapp-permission-signature-scope': TDappPermissionSignatureScopeModalState
  'export-full-transactions': TExportFullTransactionsModalState
  'hide-fraudulent-token': THideFraudulentTokenModalState
  search: undefined
  'vote-neo3-confirmation': TVoteNeo3ConfirmationModalState
  'vote-neo3-success': TVoteNeo3SuccessModalState
  'vote-neo3-support-us': TVoteNeo3SupportUsModalState
}

export type TModalRouterRouteTypes = TModalRouterSideRouteTypes & TModalRouterCenterRouteTypes
