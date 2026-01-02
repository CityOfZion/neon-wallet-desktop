import { Fragment, useState } from 'react'

import { type TWalletKitHelperProposalDetails } from '@cityofzion/bs-multichain'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappHeader } from '@renderer/components/DappHeader'
import { Details } from '@renderer/components/Details'
import { ScreenLoader } from '@renderer/components/ScreenLoader'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { invalidateWalletConnectSessions } from '@renderer/hooks/useWalletConnectSessions'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbPlug from '@renderer/assets/images/tb-plug.svg?react'

import type { TModalState } from '@shared/types/modal'

import { DappConnectionErrorContent } from './DappConnectionErrorContent'
import { DappConnectionSuccessContent } from './DappConnectionSuccessContent'

const DappConnectionRequestModal = () => {
  const { proposal, account } = useModalState<TModalState<'dapp-connection-request'>>()

  const { modalNavigate, modalErase } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnectionRequest' })

  const [isConnecting, startConnect] = usePressOnce()

  const [proposalDetails, setProposalDetails] = useState<TWalletKitHelperProposalDetails>()

  const handleRejectSession = async () => {
    WalletKitHelper.kit.rejectSession({
      id: proposal.id,
      reason: WalletKitHelper.getError('USER_REJECTED'),
    })
  }

  const handleReject = async () => {
    handleRejectSession()
    modalNavigate(-1)
  }

  const handleAccept = async () => {
    try {
      await WalletKitHelper.kit.approveSession({
        id: proposal.id,
        namespaces: proposalDetails!.approvedNamespaces,
      })

      await invalidateWalletConnectSessions()

      modalNavigate('success', {
        state: {
          heading: t('successModal.title'),
          headingIcon: <TbPlug aria-hidden />,
          subtitle: t('successModal.subtitle'),
          content: <DappConnectionSuccessContent />,
        },
        replace: true,
      })
    } catch (error: any) {
      console.error(error)

      handleReject()

      modalNavigate('error', {
        state: {
          heading: t('errorModal.title'),
          headingIcon: <TbPlug aria-hidden />,
          subtitle: t('errorModal.subtitle'),
          content: <DappConnectionErrorContent error={error.message} />,
        },
        replace: true,
      })
    }
  }

  const { isMounting } = useMountUnsafe(() => {
    try {
      setProposalDetails(
        WalletKitHelper.getProposalDetails({
          proposal,
          address: account.address,
          service: BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain],
        })
      )
    } catch (error: any) {
      console.error(error)
      WalletKitHelper.kit.rejectSession({
        id: proposal.id,
        reason: WalletKitHelper.getError('UNSUPPORTED_NAMESPACE_KEY'),
      })

      ToastHelper.error({
        message: t(`errorsByCode.${error.code}`, error.message),
        id: 'dapp-connection-details-proposal-error',
      })

      modalErase()
    }
  }, 1000)

  return (
    <CenterModalLayout onErase={handleRejectSession} contentClassName="items-center flex flex-col">
      {isMounting || !proposalDetails ? (
        <ScreenLoader />
      ) : (
        <Fragment>
          <DappHeader
            proposerUri={proposal.proposer.metadata.icons[0]}
            proposerName={proposal.proposer.metadata.name}
          />

          <p className="mt-6 text-center text-sm text-gray-100">
            <Trans t={t} i18nKey="description" values={{ name: proposal.proposer.metadata.name }} />
          </p>

          <Details.Root className="my-4">
            <Details.Header
              rightElement={
                <span className="text-right text-sm text-gray-300">
                  {proposalDetails.service.walletConnectService.chain}
                </span>
              }
              leftElement={<TbPlug aria-hidden className="text-blue" />}
            >
              {t('connectionDetailsTitle')}
            </Details.Header>

            <Details.HeaderSeparator />

            <Details.Body>
              <Details.Panel label={t('methodsDetailsTitle')}>
                <Details.Item>
                  <span className="text-sm text-white">{proposalDetails.methods.join(', ')}</span>
                </Details.Item>
              </Details.Panel>
            </Details.Body>
          </Details.Root>

          <div className="mt-auto flex w-full items-end gap-x-2.5 pb-8">
            <Button
              label={t('rejectButtonLabel')}
              colorSchema="gray"
              className="min-w-30"
              onClick={handleReject}
              disabled={isConnecting}
            />

            <Button
              label={t('acceptButtonLabel')}
              className="grow"
              onClick={startConnect(handleAccept)}
              loading={isConnecting}
            />
          </div>
        </Fragment>
      )}
    </CenterModalLayout>
  )
}

export default DappConnectionRequestModal
