import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { MdInfoOutline } from 'react-icons/md'
import { TbCheckbox } from 'react-icons/tb'
import CozLogo from '@renderer/assets/images/coz-logo.svg?react'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { VOTE_NEO3_COZ_PUB_KEY } from '@renderer/constants/public-keys'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  useVoteNeo3CalculateVoteFee,
  useVoteNeo3GetVoteDetailsByAddress,
  useVoteNeo3Validations,
} from '@renderer/hooks/useVoteNeo3'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TVoteNeo3Candidate } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

type TLocationState = {
  neo3Account: IAccountState
  candidate: TVoteNeo3Candidate
  candidateVotePercentage: string
}

export const VoteNeo3CandidateDetailsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3CandidateDetails' })
  const { modalErase } = useModalNavigate()
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

  // TODO: implement this method
  const handleGoToVoteNeo3ConfirmationModal = () => {
    if (isDisabled) return

    modalErase('center')
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdInfoOutline aria-hidden={true} />}
      contentClassName="py-0 overflow-y-auto flex flex-col"
    >
      <div className="mb-8 mt-6 flex flex-grow flex-col items-center gap-y-5 text-white">
        {(logoUrl || isCozCandidate) && (
          <div className="flex h-12 w-full max-w-52 items-center justify-center rounded-full bg-gray-700">
            {cloneElement(
              !logoUrl && isCozCandidate ? <CozLogo aria-label={name} /> : <img src={logoUrl} alt={name} />,
              { className: 'h-full max-h-8 w-fit max-w-36' }
            )}
          </div>
        )}

        <ul className="flex flex-col gap-y-2 break-all rounded bg-asphalt p-4 text-xs">
          <li className="flex flex-col">
            <strong className="font-semibold uppercase text-gray-100">{t('positionLabel')}</strong>
            <p className="mt-0.5">{position}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold uppercase text-gray-100">{t('nameLabel')}</strong>
            <p className="mt-0.5">{name}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold uppercase text-gray-100">{t('pubKeyLabel')}</strong>
            <p className="mt-0.5">{pubKey}</p>
            <Separator containerClassName="mt-2" />
          </li>
          <li className="flex flex-col">
            <strong className="font-semibold uppercase text-gray-100">{t('votesLabel')}</strong>
            <p className="mt-0.5">
              {NumberHelper.localeNumber(votes)} ({candidateVotePercentage})
            </p>
          </li>
        </ul>

        <div className="flex w-full flex-grow flex-col gap-y-1">
          {description && (
            <>
              <Separator containerClassName="mb-4" />

              <strong className="w-full text-xs font-semibold uppercase text-gray-100">{t('descriptionLabel')}</strong>

              <p className="w-full text-xs">{description}</p>
            </>
          )}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-y-5">
          {!isLoading && !isCurrentVote && !!errorMessage && (
            <AlertErrorBanner className="w-full gap-3 bg-magenta-700 p-3" message={errorMessage} />
          )}

          <Button
            label={isCurrentVote ? t('voteAlreadyCastButtonLabel') : t('castVoteButtonLabel')}
            wide
            flat
            iconsOnEdge={false}
            loading={isLoading}
            disabled={isDisabled}
            className="w-full max-w-60"
            leftIcon={<TbCheckbox aria-hidden={true} />}
            onClick={handleGoToVoteNeo3ConfirmationModal}
          />
        </div>
      </div>
    </SideModalLayout>
  )
}
