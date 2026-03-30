import type { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import type { PendingRequestTypes } from '@walletconnect/types'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useAccountsMapSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'

export const WalletConnectManagerSetup = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'private.walletConnectManagerSetup' })
  const { accountsMapRef } = useAccountsMapSelector()
  const { modalNavigate, modalErase } = useModalNavigate()

  useMountUnsafe(async () => {
    async function handleRequest(request: PendingRequestTypes.Struct) {
      const sessions = WalletKitHelper.kit.getActiveSessions()

      const session = sessions[request.topic]
      if (!session) return

      const sessionDetails = WalletKitHelper.getSessionDetails({
        session,
        services: Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName),
      })
      const sessionAccount = accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(sessionDetails))

      async function handleReject(reason?: ErrorResponse) {
        await WalletKitHelper.kit
          .respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestError(request, reason ?? WalletKitHelper.getError('USER_REJECTED')),
          })
          .catch(error =>
            LoggerHelper.error(error, { where: 'WalletConnectManagerSetup', operation: 'manualRejectRequest' })
          )
      }

      async function handleAccept() {
        try {
          const serviceAccount = await AccountHelper.getServiceAccount(sessionAccount!)

          const response = await WalletKitHelper.processRequest({
            account: serviceAccount,
            request,
            sessionDetails,
          })

          await WalletKitHelper.kit.respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestResult(request, response),
          })

          return response
        } catch (error) {
          LoggerHelper.error(error, { where: 'WalletConnectManagerSetup', operation: 'manualAcceptRequest' })

          await WalletKitHelper.kit.respondSessionRequest({
            topic: request.topic,
            response: WalletKitHelper.formatRequestError(request, {
              message: AppError.wrap(error, null).displayMessage,
              code: -32000,
            }),
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
            LoggerHelper.error(error, { where: 'WalletConnectManagerSetup', operation: 'autoAcceptRequest' })
          })
        return
      }

      window.api.sendSync('window:restore')
      modalErase()
      modalNavigate('dapp-permission', {
        state: { request, session, sessionDetails, sessionAccount, onAccept: handleAccept, onReject: handleReject },
      })
    }

    WalletKitHelper.kit.on('session_request', handleRequest)

    const pendingRequests = WalletKitHelper.kit.getPendingSessionRequests()
    const startPendingRequest = pendingRequests[0]
    if (startPendingRequest) {
      handleRequest(startPendingRequest)
    }

    return () => {
      WalletKitHelper.kit.off('session_request', handleRequest)
    }
  })

  return null
}

export default WalletConnectManagerSetup
