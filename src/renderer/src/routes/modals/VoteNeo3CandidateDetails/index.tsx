import { cloneElement } from 'react'

import type { TVoteServiceCandidate } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { NumberHelper } from '@renderer/helpers/NumberHelper'

import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  useVoteNeo3CalculateVoteFee,
  useVoteNeo3GetVoteDetailsByAddress,
  useVoteNeo3Validations,
} from '@renderer/hooks/useVoteNeo3'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import CozLogo from '@renderer/assets/images/coz-logo.svg?react'
import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import TbCheckbox from '@renderer/assets/images/tb-checkbox.svg?react'

import { VOTE_NEO3_COZ_PUB_KEY } from '@renderer/constants/public-keys'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  neo3Account: IAccountState
  candidate: TVoteServiceCandidate
  candidateVotePercentage: string
}

const VoteNeo3CandidateDetailsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3CandidateDetails' })
  const { modalNavigate } = useModalNavigate()
  const { neo3Account, candidate, candidateVotePercentage } = useModalState<TLocationState>()

  const { position, name, description, votes, pubKey, logoUrl } = candidate

  const calculateVoteFeeQuery = useVoteNeo3CalculateVoteFee({ neo3Account, candidatePubKey: pubKey })
  const voteDetailsByAddressQuery = useVoteNeo3GetVoteDetailsByAddress(neo3Account?.address)
  const balanceQuery = useBalance(neo3Account)
  const { hasEnoughGasToPayFee } = useVoteNeo3Validations({ balanceQuery, gasFee: calculateVoteFeeQuery.data })

  const neoAmount = voteDetailsByAddressQuery.data?.neoBalance ?? 0
  const hasNeoAmount = neoAmount > 0
  const isWatchAccount = neo3Account?.type === 'watch'
  const isCozCandidate = VOTE_NEO3_COZ_PUB_KEY === pubKey
  const isCurrentVote = voteDetailsByAddressQuery.data?.candidatePubKey === pubKey
  const isLoading = voteDetailsByAddressQuery.isLoading || calculateVoteFeeQuery.isLoading || balanceQuery.isLoading
  const isDisabled = isCurrentVote || isLoading || !hasEnoughGasToPayFee || !hasNeoAmount

  const errorMessage = match({ neo3Account, hasNeoAmount, isWatchAccount, hasEnoughGasToPayFee })
    .with({ neo3Account: P.when(value => !value) }, () => t('selectNeo3AccountTitle'))
    .with({ hasNeoAmount: false }, () => t('thereIsNoNeoTitle'))
    .with({ isWatchAccount: true }, () => t('accountCanNotBeWatchTitle'))
    .with({ hasEnoughGasToPayFee: false }, () => (
      <div className="flex flex-col gap-y-0.5">
        <p className="text-white">{t('insufficientGasTitle')}</p>
        <p className="text-gray-200">{t('insufficientGasDescription')}</p>
      </div>
    ))
    .otherwise(() => undefined)

  const handleGoToVoteNeo3ConfirmationModal = () => {
    if (isDisabled) return

    modalNavigate('vote-neo3-confirmation', {
      replace: true,
      state: { neo3Account, candidate },
    })
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdInfoOutline aria-hidden />}
      contentClassName="py-0 overflow-y-auto flex flex-col"
    >
      <div className="mt-6 mb-8 flex grow flex-col items-center gap-y-5 text-white">
        {(logoUrl || isCozCandidate) && (
          <div className="flex h-12 w-full max-w-52 items-center justify-center rounded-full bg-gray-700">
            {cloneElement(
              !logoUrl && isCozCandidate ? <CozLogo aria-label={name} /> : <img src={logoUrl} alt={name} />,
              { className: 'h-full max-h-8 w-fit max-w-36' }
            )}
          </div>
        )}

        <ul className="bg-asphalt flex flex-col gap-y-2 rounded-sm p-4 text-xs break-all">
          <li className="flex flex-col">
            <strong className="font-semibold text-gray-100 uppercase">{t('positionLabel')}</strong>
            <p className="mt-0.5">{position}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold text-gray-100 uppercase">{t('nameLabel')}</strong>
            <p className="mt-0.5">{name}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold text-gray-100 uppercase">{t('pubKeyLabel')}</strong>
            <p className="mt-0.5">{pubKey}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold text-gray-100 uppercase">{t('votesLabel')}</strong>
            <p className="mt-0.5">
              {NumberHelper.localeNumber(votes)} ({candidateVotePercentage})
            </p>
          </li>
        </ul>

        <div className="flex w-full grow flex-col gap-y-1">
          {description && (
            <>
              <Separator containerClassName="mb-4" />

              <strong className="w-full text-xs font-semibold text-gray-100 uppercase">{t('descriptionLabel')}</strong>

              <p className="w-full text-xs">{description}</p>
            </>
          )}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-y-5">
          {!isLoading && !isCurrentVote && !!errorMessage && (
            <AlertErrorBanner className="bg-magenta-700 w-full gap-3 p-3" message={errorMessage} />
          )}

          <Button
            label={isCurrentVote ? t('voteAlreadyCastButtonLabel') : t('castVoteButtonLabel')}
            wide
            flat
            iconsOnEdge={false}
            loading={isLoading}
            disabled={isDisabled}
            className="w-full max-w-60"
            leftIcon={<TbCheckbox aria-hidden />}
            onClick={handleGoToVoteNeo3ConfirmationModal}
          />
        </div>
      </div>
    </SideModalLayout>
  )
}

export default VoteNeo3CandidateDetailsModal
