import type {
  IBlockchainService,
  TBridgeToken,
  TBSBridgeName,
  TBSToken,
  TNftResponse,
} from '@cityofzion/blockchain-service'
import type { TWalletKitHelperSessionDetails } from '@cityofzion/bs-multichain'
import type { TBSNeo3Name, TVoteServiceCandidate } from '@cityofzion/bs-neo3'
import type { TBSStellarName } from '@cityofzion/bs-stellar'
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
import type { TAccount, TContact, TContactAddress, TNetworkProfile, TSwapRecord, TWallet } from './store'

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
  isMulti?: boolean
  onSelect: (blockchains: TBlockchainServiceKey[]) => void | Promise<void>
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
  accounts: TAccount[]
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
  account: TAccount
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
  wallet: TWallet
}

type TEditWalletModalState = {
  wallet: TWallet
}

type TErrorModalState = {
  heading: string
  headingIcon?: JSX.Element
  subtitle?: string
  description?: string
  content: JSX.Element
}

type TExportKeyModalState = {
  account: TAccount
}

type TExportMnemonicModalState = {
  wallet: TWallet
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
  tokenToUse: TBridgeToken<TBSBridgeName>
  tokenToReceive: TBridgeToken<TBSBridgeName>
  accountToUse: TAccount
  amountToUse: string
  amountToReceive: string
  addressToReceive: string
  bridgeFee: string
  fromService: IBlockchainService<TBSBridgeName>
}

type TNeo3NeoxBridgeDetailsModalState = {
  tokenToUse: TBridgeToken<TBSBridgeName>
  tokenToReceive: TBridgeToken<TBSBridgeName>
  accountToUse: TAccount
  amountToUse: string
  amountToReceive: string
  addressToReceive: string
  transactionHash?: string
  confirmed?: boolean
}

type TNetworkUrlSelectionModalState = {
  blockchain: TBlockchainServiceKey
}

type TNetworkSelectionModalState = {
  blockchain: TBlockchainServiceKey
}

type TNftSelectionModalState = {
  account: TAccount
  onSelect: (nft: TNftResponse) => void
}

type TPersistAccountModalState =
  | {
      account?: TAccount
      wallet?: TWallet
    }
  | undefined

type TPersistContactModalState =
  | {
      contact?: TContact
      addresses?: TContactAddress[]
    }
  | undefined

type TSelectAccountModalState = {
  onSelectAccount: (contact: TAccount) => void
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
  account?: TAccount
}

type TSellTokensDepositModalState = {
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  account?: TAccount
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

type TNeo3VoteCandidateDetailsModalState = {
  neo3Account: TAccount<TBSNeo3Name>
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
  'network-url-selection': TNetworkUrlSelectionModalState
  'network-selection': TNetworkSelectionModalState
  'nft-selection': TNftSelectionModalState
  notifications: undefined
  'persist-account': TPersistAccountModalState
  'persist-contact': TPersistContactModalState
  'select-account': TSelectAccountModalState
  'select-contact': TSelectContactModalState
  'sell-tokens-deposit': TSellTokensDepositModalState
  success: TSuccessModalState
  'support-ticket': undefined
  'swap-details': TSwapDetailsModalState
  'swap-details-log': TSwapDetailsLogModalState
  'neo3-vote-candidate-details': TNeo3VoteCandidateDetailsModalState
}

type TBuyAndSellTokensLeaveAlertModalState = {
  onContinue: () => void
}

type TDappConnectionModalState = {
  account: TAccount
  uri?: string
}

type TDappConnectionRequestModalState = {
  proposal: ProposalTypes.Struct
  account: TAccount
}

type TDappPermissionContractDetailsModalState = {
  session: SessionTypes.Struct
  hash: string
  operation: string
  blockchain: TBlockchainServiceKey
  values: any[]
  onReject: () => void
}

type TDappPermissionModalState = {
  session: SessionTypes.Struct
  request: PendingRequestTypes.Struct
  sessionDetails: TWalletKitHelperSessionDetails
  sessionAccount: TAccount
  onReject: (reason?: ErrorResponse) => Promise<void>
  onAccept: () => Promise<any>
}

type TDappPermissionSignatureScopeModalState = {
  session: SessionTypes.Struct
  scope: string
  allowedList?: string[]
  onReject: () => void
}

type TExportFullTransactionsModalState =
  | {
      account: TAccount
      dateFrom?: Date
      dateTo?: Date
    }
  | undefined

type THideFraudulentTokenModalState = {
  account: TAccount
  hash: string
}

type TNeo3VoteConfirmationModalState = {
  neo3Account: TAccount<TBSNeo3Name>
  candidate: TVoteServiceCandidate
}

type TNeo3VoteSuccessModalState = {
  neo3Account: TAccount<TBSNeo3Name>
  candidate: TVoteServiceCandidate
}

type TNeo3VoteSupportUsModalState = {
  neo3Account: TAccount<TBSNeo3Name>
  cozCandidate: TVoteServiceCandidate
}

type TStellarTrustlinesModalState = {
  stellarAccount: TAccount<TBSStellarName>
}

type TStellarPersistTrustlineModalState = {
  stellarAccount: TAccount<TBSStellarName>
  token?: TBSToken
  limit?: string
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
  'neo3-vote-confirmation': TNeo3VoteConfirmationModalState
  'neo3-vote-success': TNeo3VoteSuccessModalState
  'neo3-vote-support-us': TNeo3VoteSupportUsModalState
  'stellar-trustlines': TStellarTrustlinesModalState
  'stellar-persist-trustlines': TStellarPersistTrustlineModalState
}

export type TModalRouterRouteTypes = TModalRouterSideRouteTypes & TModalRouterCenterRouteTypes
