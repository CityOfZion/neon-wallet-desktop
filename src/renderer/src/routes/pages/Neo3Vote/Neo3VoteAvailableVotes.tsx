import type { TBSNeo3Name } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@renderer/components/Skeleton'
import { Tooltip } from '@renderer/components/Tooltip'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useNeo3VoteGetVoteDetailsByAddress } from '@renderer/hooks/useNeo3Vote'

import { TAccount } from '@shared/types/store'

type TProps = {
  neoAmount: number
  voteErrorMessage?: string
  hasNeoAmount: boolean
  neo3Account?: TAccount<TBSNeo3Name>
}

export const Neo3VoteAvailableVotes = ({ neoAmount, voteErrorMessage, hasNeoAmount, neo3Account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'neo3Vote.availableVotes' })
  const voteDetailsByAddressQuery = useNeo3VoteGetVoteDetailsByAddress(neo3Account?.address)

  return (
    <p className="flex items-center gap-x-4 text-lg">
      {t('availableVotesLabel')}{' '}
      {voteDetailsByAddressQuery.isLoading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <Tooltip
          title={voteErrorMessage || ''}
          variant="black"
          delayDuration={0}
          contentProps={{ className: 'max-w-32' }}
        >
          <span
            className={StyleHelper.mergeStyles('text-gray-100', {
              'text-pink': !hasNeoAmount,
            })}
          >
            {hasNeoAmount ? neoAmount : t('noAvailableVotesLabel')}
          </span>
        </Tooltip>
      )}
    </p>
  )
}
