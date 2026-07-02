import { useEffect } from 'react'

import { BSNeoXConstants } from '@cityofzion/bs-neox'
import type { WalletKitTypes } from '@reown/walletkit'
import type { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useConfirmAction } from '@renderer/hooks/useConfirmAction'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import { WalletConnectError } from '@shared/helpers/SharedErrorHelper'
import type { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

import { DappPermissionErrorContent } from './DappPermissionErrorContent'
import { DappPermissionGenericContent } from './DappPermissionGenericContent'
import { DappPermissionInvokeNeo3Content } from './DappPermissionInvokeNeo3Content'
import { DappPermissionSuccessContent } from './DappPermissionSuccessContent'

export type TDappPermissionProps = Omit<TModalState<'dapp-permission'>, 'onAccept' | 'onReject'> & {
  onAccept: () => void
  onReject: (reason?: ErrorResponse, toastMessage?: string) => void
  isAccepting: boolean
  isRejecting: boolean
}

const CUSTOM_CONTENT_BY_REQUEST: Partial<
  Record<TBlockchainServiceKey, Record<string, (props: TDappPermissionProps) => JSX.Element>>
> = {
  neo3: {
    invokeFunction: DappPermissionInvokeNeo3Content,
    signTransaction: DappPermissionInvokeNeo3Content,
  },
}

export const DappPermissionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })

  const { session, request, onAccept, onReject, sessionAccount, sessionDetails } =
    useModalState<TModalState<'dapp-permission'>>()

  const { modalErase, modalNavigate } = useModalNavigate()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { confirmAction } = useConfirmAction()

  const blockchain = sessionAccount.blockchain || sessionDetails.blockchain
  const network = selectedNetworkProfile.networkByBlockchain[blockchain]

  const handleReject = async (reason?: ErrorResponse, toastMessage?: string) => {
    await onReject(reason)

    ToastHelper.error({ message: toastMessage || t('errors.cancelled'), id: 'dapp-permission-cancel' })
  }

  const [isRejecting, startReject] = usePressOnce(async (reason?: ErrorResponse | undefined, toastMessage?: string) => {
    try {
      await handleReject(reason, toastMessage)
    } finally {
      modalErase()
    }
  })

  const [isAccepting, startAccept] = usePressOnce(async () => {
    try {
      await confirmAction({ account: sessionAccount })
      const response = await onAccept()

      modalNavigate('success', {
        replace: true,
        state: {
          heading: t('successContent.title'),
          subtitle: t('successContent.subtitle'),
          content: <DappPermissionSuccessContent response={response} />,
        },
      })
    } catch (error: any) {
      const walletConnectError = WalletConnectError.wrap(error)

      if (walletConnectError.fromAppError) {
        ToastHelper.error({ message: walletConnectError.displayMessage, id: 'dapp-permission-error' })
        return
      }

      const hasNonce = !!request.params.request.params?.[0]?.nonce

      const isNeoxAntiMev =
        blockchain === 'neox' &&
        BSNeoXConstants.ANTI_MEV_RPC_LIST_BY_NETWORK_ID[network.id].some(url => url === network.url)

      // It's expected to receive a transaction cached error on first Anti-MEV transaction
      if (isNeoxAntiMev && hasNonce && error.message?.includes('transaction cached')) {
        modalNavigate('success', {
          replace: true,
          state: {
            heading: t('successContent.title'),
            subtitle: t('successContent.subtitle'),
            // Don't translate the response, because this property isn't translated, it comes from RPC
            content: <DappPermissionSuccessContent response="Transaction cached" />,
          },
        })

        return
      }

      modalNavigate('error', {
        replace: true,
        state: {
          heading: t('errorContent.title'),
          subtitle: t('errorContent.subtitle'),
          content: <DappPermissionErrorContent error={walletConnectError.displayMessage} />,
        },
      })
    }
  })

  useEffect(() => {
    const handle = ({ id }: WalletKitTypes.SessionRequestExpire) => {
      if (id !== request.id) return
      ToastHelper.error({ message: t('errors.expired'), id: 'dapp-permission-expired' })
      modalErase()
    }

    WalletKitHelper.kit.on('session_request_expire', handle)

    return () => {
      WalletKitHelper.kit.off('session_request_expire', handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id, t])

  const Content = CUSTOM_CONTENT_BY_REQUEST[blockchain]?.[request.params.request.method] || DappPermissionGenericContent

  return (
    <CenterModalLayout
      contentClassName="px-0 flex flex-col pb-5 min-h-0"
      eraseOnEsc={false}
      eraseOnClickOutside={false}
      onErase={handleReject}
    >
      <Content
        request={request}
        session={session}
        sessionDetails={sessionDetails}
        sessionAccount={sessionAccount}
        onAccept={startAccept}
        onReject={startReject}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
      />
    </CenterModalLayout>
  )
}

export default DappPermissionModal
