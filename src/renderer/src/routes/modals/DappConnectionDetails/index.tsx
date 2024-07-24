import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPlug } from 'react-icons/tb'
import { TSessionProposal } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import dappFallbackIcon from '@renderer/assets/images/dapp-fallback-icon.png'
import { ReactComponent as NeonWalletLogo } from '@renderer/assets/images/neon-wallet-full.svg'
import { ReactComponent as WalletConnectLogo } from '@renderer/assets/images/wallet-connect.svg'
import { Button } from '@renderer/components/Button'
import { ImageWithFallback } from '@renderer/components/ImageWithFallback'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
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

  const [proposalInformation, setProposalInformation] = useState<TWalletConnectHelperProposalInformation[]>()
  const [loading, setLoading] = useState(false)

  const handleClose = async () => {
    await rejectProposal(proposal)
  }

  const handleDecline = async () => {
    await rejectProposal(proposal)
    modalNavigate(-1)
  }

  const handleAccept = async () => {
    try {
      setLoading(true)

      try {
        const accountProposalInformation = proposalInformation?.find(info => info.blockchain === account.blockchain)
        if (!accountProposalInformation) throw new Error(t('errorModal.accountProposalError'))

        if (accountProposalInformation.network !== networkRef.current.id)
          throw new Error(t('errorModal.differentNetworkError'))

        try {
          await approveProposal(proposal, {
            address: account.address,
            chain: accountProposalInformation.network,
            blockchain: accountProposalInformation.proposalBlockchain,
          })
          modalNavigate(-1)
          modalNavigate('success', {
            state: {
              heading: t('successModal.title'),
              headingIcon: <TbPlug />,
              subtitle: t('successModal.subtitle'),
              content: <DappConnectionSuccessContent />,
            },
          })
        } catch {
          modalNavigate(-1)
          modalNavigate('error', {
            state: {
              heading: t('errorModal.title'),
              headingIcon: <TbPlug />,
              subtitle: t('errorModal.subtitle'),
              content: <DappConnectionErrorContent />,
            },
          })
        }
      } catch (error: any) {
        rejectProposal(proposal)
        ToastHelper.error({ message: error.message })
        modalNavigate(-1)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const proposalInformation = WalletConnectHelper.getInformationFromProposal(proposal)
      setProposalInformation(proposalInformation)
    } catch {
      rejectProposal(proposal)
      ToastHelper.error({ message: t('errorModal.genericError'), id: 'dapp-connection-details-proposal-error' })
      modalNavigate(-1)
    }
  }, [proposal, modalNavigate, rejectProposal, t])

  return (
    <CenterModalLayout onClose={handleClose} contentClassName="items-center justify-center flex flex-col">
      {proposalInformation ? (
        <Fragment>
          <div className="flex w-full gap-x-12 items-center">
            <NeonWalletLogo className="w-full h-min" />

            <WalletConnectLogo className="w-full h-min opacity-60" />
          </div>

          <ImageWithFallback
            src={proposal.params.proposer.metadata.icons[0]}
            alt={`${proposal.params.proposer.metadata.name} icon`}
            fallbackSrc={dappFallbackIcon}
            className="max-h-[2.25rem] max-w-[4rem] object-contain mt-5 rounded-sm "
          />

          <p className="text-white text-2xl mt-9">{t('title')}</p>

          <p className="text-gray-100 text-sm mt-6 text-center">
            {t('description', { name: proposal.params.proposer.metadata.name })}
          </p>

          <ul className="flex flex-col gap-2 flex-grow  w-full mt-2 overflow-y-auto">
            {proposalInformation.map(info => (
              <li key={info.blockchain} className="w-full flex flex-col bg-gray-900 rounded text-white px-4 py-2.5">
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-x-2.5">
                    <TbPlug className="stroke-blue w-6 h-6" />

                    <span>{t('connectionDetailsTitle')}</span>
                  </div>

                  <span className="text-gray-300">{info.chain}</span>
                </div>

                <Separator className="my-2.5" />

                <ul className="text-xs grid max-h-[10rem] overflow-y-scroll grid-cols-2">
                  {info.methods.map(method => (
                    <li key={method} className="list-disc w-1/2 mx-4">
                      {method}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="flex gap-x-2.5 w-full mt-4 items-end">
            <Button
              label="Decline"
              colorSchema="gray"
              className="min-w-[7.5rem]"
              onClick={handleDecline}
              disabled={loading}
            />

            <Button label="Accept" className="flex-grow" onClick={handleAccept} loading={loading} />
          </div>
        </Fragment>
      ) : (
        <Loader className="w-10 h-10" />
      )}
    </CenterModalLayout>
  )
}
