import { Fragment, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPlug } from 'react-icons/tb'
import { ResponseErrorCode } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { TSession, TSessionRequest, useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TWalletConnectHelperSessionInformation } from '@shared/@types/helpers'
import { IAccountState } from '@shared/@types/store'

import { EthereumSendTransactionDappPermission } from './Ethereum/SendTransactionDappPermission'
import { EthereumSignMessageDappPermission } from './Ethereum/SignMessageDappPermission'
import { EthereumSignTransactionDappPermission } from './Ethereum/SignTransactionDappPermission'
import { EthereumSignTypedDataDappPermission } from './Ethereum/SignTypedDataDappPermission'
import { Neo3DecryptDappPermission } from './Neo3/DecryptDappPermission'
import { Neo3DecryptFromArrayDappPermission } from './Neo3/DecryptFromArrayDappPermission'
import { Neo3EncryptDappPermission } from './Neo3/EncryptDappPermission'
import { Neo3InvokeFunctionDappPermission } from './Neo3/InvokeFunctionDappPermission'
import { Neo3SignMessageDappPermission } from './Neo3/SignMessageDappPermission'
import { Neo3SignTransactionDappPermission } from './Neo3/SignTransactionDappPermission'
import { Neo3VerifyMessageDappPermission } from './Neo3/VerifyMessageDappPermission'
import { ErrorModalContent } from './ErrorModalContent'

type TModalState = {
  session: TSession
  request: TSessionRequest
}

export type TDappPermissionComponentProps = {
  request: TSessionRequest
  session: TSession
  account: IAccountState
  sessionInfo: TWalletConnectHelperSessionInformation
  onReject: (errorToast?: string, errorDapp?: string) => void
  onAccept: (heading: string, subtitle: string, content?: (props: any) => JSX.Element) => Promise<void>
}

const componentsByBlockchain: Partial<
  Record<TBlockchainServiceKey, Record<string, (props: TDappPermissionComponentProps) => JSX.Element>>
> = {
  neo3: {
    invokeFunction: Neo3InvokeFunctionDappPermission,
    signMessage: Neo3SignMessageDappPermission,
    verifyMessage: Neo3VerifyMessageDappPermission,
    encrypt: Neo3EncryptDappPermission,
    decrypt: Neo3DecryptDappPermission,
    decryptFromArray: Neo3DecryptFromArrayDappPermission,
    signTransaction: Neo3SignTransactionDappPermission,
  },
  ethereum: {
    personal_sign: EthereumSignMessageDappPermission,
    eth_sign: EthereumSignMessageDappPermission,
    eth_signTransaction: EthereumSignTransactionDappPermission,
    eth_signTypedData: EthereumSignTypedDataDappPermission,
    eth_signTypedData_v3: EthereumSignTypedDataDappPermission,
    eth_signTypedData_v4: EthereumSignTypedDataDappPermission,
    eth_sendTransaction: EthereumSendTransactionDappPermission,
  },
}

export const DappPermissionModal = () => {
  const { session, request } = useModalState<TModalState>()
  const { modalNavigate } = useModalNavigate()
  const { rejectRequest, approveRequest } = useWalletConnectWallet()
  const { accounts } = useAccountsSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })

  const sessionInfo = WalletConnectHelper.getAccountInformationFromSession(session)
  const method = request.params.request.method

  const account = accounts.find(AccountHelper.predicate(sessionInfo))
  const Component = componentsByBlockchain[sessionInfo.blockchain]?.[method]

  const handleCancel = useCallback(
    (errorToast?: string, dappError?: string) => {
      modalNavigate(-1)
      rejectRequest(
        request,
        !!errorToast || !!dappError
          ? { message: dappError ?? errorToast ?? '', code: ResponseErrorCode.REJECT }
          : undefined
      )
      ToastHelper.error({ message: errorToast ?? t('cancelled'), id: 'dapp-permission-cancel' })
    },
    [modalNavigate, rejectRequest, request, t]
  )

  const handleAccept = async (heading: string, subtitle: string, Content?: (result: any) => JSX.Element) => {
    try {
      const { result } = await approveRequest(request)
      modalNavigate(-1)
      modalNavigate('success', {
        state: {
          heading,
          headingIcon: <TbPlug />,
          subtitle,
          content: Content ? <Content result={result} /> : undefined,
        },
      })
    } catch (error: any) {
      modalNavigate(-1)
      modalNavigate('error', {
        state: {
          heading: t('errorModal.heading'),
          headingIcon: <TbPlug />,
          subtitle: t('errorModal.subtitle'),
          content: <ErrorModalContent error={error.message} />,
        },
      })
    }
  }

  if (!account || !Component) {
    ToastHelper.error({ message: t('unsupportedMethodError', { method }), id: 'dapp-permission-method-error' })
    rejectRequest(request)
    modalNavigate(-1)

    return <Fragment />
  }

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0" onClose={rejectRequest.bind(null, request)}>
      <Component
        request={request}
        session={session}
        account={account}
        sessionInfo={sessionInfo}
        onReject={handleCancel}
        onAccept={handleAccept}
      />
    </CenterModalLayout>
  )
}
