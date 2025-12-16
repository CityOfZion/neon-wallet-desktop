import { useEffect } from 'react'

import type { WalletKitTypes } from '@reown/walletkit'
import type { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import { walletKit } from '@renderer/libs/wallet-connect'
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

  const handleReject = async (reason?: ErrorResponse, toastMessage?: string) => {
    await onReject(reason)
    ToastHelper.error({ message: toastMessage ?? t('errors.cancelled'), id: 'dapp-permission-cancel' })
  }

  const [isRejecting, startReject] = usePressOnce(async () => {
    try {
      await handleReject()
    } finally {
      modalErase()
    }
  })

  const [isAccepting, startAccept] = usePressOnce(async () => {
    try {
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
      modalNavigate('error', {
        replace: true,
        state: {
          heading: t('errorContent.title'),
          subtitle: t('errorContent.subtitle'),
          content: <DappPermissionErrorContent error={error} />,
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

    walletKit.on('session_request_expire', handle)

    return () => {
      walletKit.off('session_request_expire', handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id, t])

  const Content =
    CUSTOM_CONTENT_BY_REQUEST[sessionDetails.blockchain]?.[request.params.request.method] ??
    DappPermissionGenericContent

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0" onErase={handleReject}>
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
