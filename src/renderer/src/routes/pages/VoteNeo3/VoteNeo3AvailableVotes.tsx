import { useTranslation } from 'react-i18next'

import { Skeleton } from '@renderer/components/Skeleton'
import { Tooltip } from '@renderer/components/Tooltip'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useVoteNeo3GetVoteDetailsByAddress } from '@renderer/hooks/useVoteNeo3'

import { IAccountState } from '@shared/types/store'

type TProps = {
  neoAmount: number
  voteErrorMessage?: string
  hasNeoAmount: boolean
  neo3Account?: IAccountState
}

export const VoteNeo3AvailableVotes = ({ neoAmount, voteErrorMessage, hasNeoAmount, neo3Account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3.availableVotes' })
  const voteDetailsByAddressQuery = useVoteNeo3GetVoteDetailsByAddress(neo3Account?.address)

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
