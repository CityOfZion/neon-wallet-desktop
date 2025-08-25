import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TSessionProposal } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import dappFallbackIcon from '@renderer/assets/images/dapp-fallback-icon.png'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import TbPlug from '@renderer/assets/images/tb-plug.svg?react'
import WalletConnectLogo from '@renderer/assets/images/wallet-connect.svg?react'
import { Button } from '@renderer/components/Button'
import { ImageWithFallback } from '@renderer/components/ImageWithFallback'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { TWalletConnectHelperProposalInformation } from '@shared/@types/helpers'
import { IAccountState } from '@shared/@types/store'

import { DappConnectionErrorContent } from './DappConnectionErrorContent'
import { DappConnectionSuccessContent } from './DappConnectionSuccessContent'

type TModalState = {
  proposal: TSessionProposal
  account: IAccountState
}

export const DappConnectionDetailsModal = () => {
  const { proposal, account } = useModalState<TModalState>()
  const { rejectProposal, approveProposal } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { networkRef } = useSelectedNetworkSelector(account.blockchain)
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnectionDetails' })

  const [proposalInformation, setProposalInformation] = useState<TWalletConnectHelperProposalInformation>()
  const [loading, setLoading] = useState(false)

  const handleOnClose = async () => {
    await rejectProposal(proposal)
  }

  const handleDecline = async () => {
    await rejectProposal(proposal)

    modalNavigate(-1)
  }

  const handleAccept = async () => {
    if (!proposalInformation) return

    setLoading(true)

    try {
      await approveProposal(proposal, {
        address: account.address,
        chain: proposalInformation.network,
        blockchain: proposalInformation.proposalBlockchain,
      })

      modalNavigate(-1)
      modalNavigate('success', {
        state: {
          heading: t('successModal.title'),
          headingIcon: <TbPlug aria-hidden={true} />,
          subtitle: t('successModal.subtitle'),
          content: <DappConnectionSuccessContent />,
        },
      })
    } catch (error: any) {
      console.error(error)

      try {
        await rejectProposal(proposal)
      } catch {
        /* empty */
      }

      if (error?.message) ToastHelper.error({ message: error.message })

      modalNavigate(-1)
      modalNavigate('error', {
        state: {
          heading: t('errorModal.title'),
          headingIcon: <TbPlug aria-hidden={true} />,
          subtitle: t('errorModal.subtitle'),
          content: <DappConnectionErrorContent />,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useMountUnsafe(() => {
    try {
      const proposalInformation = WalletConnectHelper.getInformationFromProposal(proposal, account)

      if (proposalInformation.length === 0) throw new Error(t('errorModal.accountProposalError'))

      const selectedNetworkProposalInformation = proposalInformation.find(
        information => information.network === networkRef.current.id
      )

      if (!selectedNetworkProposalInformation) throw new Error(t('errorModal.differentNetworkError'))

      setProposalInformation(selectedNetworkProposalInformation)
    } catch (error: any) {
      rejectProposal(proposal)
      ToastHelper.error({ message: error.message, id: 'dapp-connection-details-proposal-error' })
      modalNavigate(-1)
    }
  })

  return (
    <CenterModalLayout onClose={handleOnClose} contentClassName="items-center justify-center flex flex-col">
      {proposalInformation ? (
        <Fragment>
          <div className="flex w-full items-center gap-x-12">
            <NeonWalletLogo aria-hidden={true} className="h-min w-full" />

            <WalletConnectLogo aria-hidden={true} className="h-min w-full opacity-60" />
          </div>

          <ImageWithFallback
            src={proposal.params.proposer.metadata.icons[0]}
            alt={`${proposal.params.proposer.metadata.name} icon`}
            fallbackSrc={dappFallbackIcon}
            className="mt-5 max-h-[2.25rem] max-w-[4rem] rounded-sm object-contain"
          />

          <p className="mt-9 text-2xl text-white">{t('title')}</p>

          <p className="mt-6 text-center text-sm text-gray-100">
            {t('description', { name: proposal.params.proposer.metadata.name })}
          </p>

          <ul className="mt-2 flex w-full flex-grow flex-col gap-2 overflow-y-auto">
            {proposalInformation && (
              <li
                key={proposalInformation.blockchain}
                className="flex w-full flex-col rounded bg-gray-900 px-4 py-2.5 text-white"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-x-2.5">
                    <TbPlug aria-hidden={true} className="h-6 w-6 stroke-blue" />

                    <span>{t('connectionDetailsTitle')}</span>
                  </div>

                  <span className="text-gray-300">{proposalInformation.chain}</span>
                </div>

                <Separator className="my-2.5" />

                <ul className="grid max-h-[10rem] grid-cols-2 overflow-y-scroll text-xs">
                  {proposalInformation.methods.map(method => (
                    <li key={method} className="mx-4 w-1/2 list-disc">
                      {method}
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>

          <div className="mt-4 flex w-full items-end gap-x-2.5">
            <Button
              label={t('declineButtonLabel')}
              colorSchema="gray"
              className="min-w-[7.5rem]"
              onClick={handleDecline}
              disabled={loading}
            />

            <Button label={t('acceptButtonLabel')} className="flex-grow" onClick={handleAccept} loading={loading} />
          </div>
        </Fragment>
      ) : (
        <Loader className="h-10 w-10" />
      )}
    </CenterModalLayout>
  )
}
