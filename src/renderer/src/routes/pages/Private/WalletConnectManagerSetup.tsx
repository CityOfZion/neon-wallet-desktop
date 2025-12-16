import { WalletKitHelper } from '@cityofzion/bs-multichain'
import type { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import type { PendingRequestTypes } from '@walletconnect/types'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountMapSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { walletKit } from '@renderer/libs/wallet-connect'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

export const WalletConnectManagerSetup = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'private.walletConnectManagerSetup' })
  const { accountsMapRef } = useAccountMapSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { modalNavigate, modalErase } = useModalNavigate()

  useMountUnsafe(async () => {
    async function handleRequest(request: PendingRequestTypes.Struct) {
      const sessions = walletKit.getActiveSessions()

      const session = sessions[request.topic]
      if (!session) return

      const sessionDetails = WalletKitHelper.getSessionDetails({
        session,
        services: Object.values(bsAggregator.blockchainServicesByName),
      })
      const sessionAccount = accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(sessionDetails))

      async function handleReject(reason?: ErrorResponse) {
        await walletKit
          .respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestError(request, reason ?? WalletKitHelper.getError('USER_REJECTED')),
          })
          .catch(console.error)
      }

      async function handleAccept() {
        try {
          const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: sessionAccount!.encryptedKey!,
            encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
          })
          if (!key) throw new Error('Unexpected missing key for account')

          const serviceAccount = AccountHelper.getServiceAccount({ account: sessionAccount!, key })

          const response = await WalletKitHelper.processRequest({
            account: serviceAccount,
            request,
            sessionDetails,
          })

          await walletKit.respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestResult(request, response),
          })

          return response
        } catch (error: any) {
          console.error(error)
          await walletKit.respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestError(request, error.message),
          })

          throw error
        }
      }

      if (!sessionAccount || sessionAccount.type === 'watch') {
        handleReject(WalletKitHelper.getError('UNSUPPORTED_NAMESPACE_KEY'))
        return
      }

      const method = request.params.request.method

      if (sessionDetails.service.walletConnectService.autoApproveMethods.includes(method)) {
        ToastHelper.loading({
          message: t('autoAcceptProcessingMessage'),
          id: 'auto-approve-walletconnect-request',
        })

        handleAccept()
          .then(() => {
            ToastHelper.dismiss('auto-approve-walletconnect-request')
            ToastHelper.success({ message: t('autoAcceptSuccessMessage') })
          })
          .catch(error => {
            ToastHelper.dismiss('auto-approve-walletconnect-request')
            ToastHelper.error({ message: t('autoAcceptErrorMessage') })
            console.error(error)
          })
        return
      }

      window.api.sendSync('restore')
      modalErase()
      modalNavigate('dapp-permission', {
        state: { request, session, sessionDetails, sessionAccount, onAccept: handleAccept, onReject: handleReject },
      })
    }

    walletKit.on('session_request', handleRequest)

    const pendingRequests = walletKit.getPendingSessionRequests()
    const startPendingRequest = pendingRequests[0]
    if (startPendingRequest) {
      handleRequest(startPendingRequest)
    }

    return () => {
      walletKit.off('session_request', handleRequest)
    }
  })

  return null
}

export default WalletConnectManagerSetup
