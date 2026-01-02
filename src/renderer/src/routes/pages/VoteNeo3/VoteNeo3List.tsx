import { useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Tooltip } from '@renderer/components/Tooltip'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useVoteNeo3GetCandidatesToVote } from '@renderer/hooks/useVoteNeo3'

import TbAlertTriangleFilled from '@renderer/assets/images/tb-filled-alert-triangle.svg?react'

import { IAccountState } from '@shared/types/store'

import { VoteNeo3ListItem } from './VoteNeo3ListItem'
import { VoteNeo3NotFound } from './VoteNeo3NotFound'
import { VoteNeo3Skeleton } from './VoteNeo3Skeleton'

type TProps = {
  neo3Account?: IAccountState
  search: string
  voteErrorMessage?: string
  canVote: boolean
}

export const VoteNeo3List = ({ neo3Account, search, voteErrorMessage, canVote }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3.list' })
  const candidatesToVoteQuery = useVoteNeo3GetCandidatesToVote()
  const [pubKeySize, setPubKeySize] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const candidates = useMemo(
    () =>
      candidatesToVoteQuery.data?.toSorted(({ pubKey }) => (pubKey === ConstantsHelper.voteNeo3CozPubKey ? -1 : 1)) ??
      [],
    [candidatesToVoteQuery.data]
  )

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = StringHelper.normalizeText(search)

    if (normalizedSearch.length !== 0 && candidates.length !== 0)
      return candidates.filter(({ name, pubKey, hash, location }) => {
        if (pubKey === ConstantsHelper.voteNeo3CozPubKey) return true

        return (
          StringHelper.normalizeText(name).includes(normalizedSearch) ||
          StringHelper.normalizeText(pubKey).includes(normalizedSearch) ||
          StringHelper.normalizeText(hash).includes(normalizedSearch) ||
          StringHelper.normalizeText(location).includes(normalizedSearch)
        )
      })

    return candidates
  }, [candidates, search])

  const votesTotal = useMemo(
    () => candidates.reduce((accumulator, candidate) => accumulator + candidate.votes, 0),
    [candidates]
  )

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return

      setPubKeySize(
        match(entry.contentRect.width)
          .with(
            P.when(value => value <= 1000),
            () => 30
          )
          .with(
            P.when(value => value <= 1100),
            () => 45
          )
          .with(
            P.when(value => value <= 1200),
            () => 56
          )
          .with(
            P.when(value => value <= 1300),
            () => 60
          )
          .otherwise(() => 74)
      )
    })

    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex min-h-0 w-full">
      {match({ isLoading: candidatesToVoteQuery.isLoading, candidates: filteredCandidates })
        .with({ isLoading: true }, () => <VoteNeo3Skeleton />)
        .with({ candidates: P.when(value => value.length === 0) }, () => <VoteNeo3NotFound />)
        .otherwise(() => (
          <div className="flex min-h-0 w-full flex-col overflow-y-auto text-sm">
            <div className="mb-2 flex w-full items-center font-medium text-gray-100 uppercase" role="row" aria-hidden>
              <p className="w-32 max-w-32 min-w-32 pl-3" id="column-position" role="columnheader">
                {t('positionColumnLabel')}
              </p>

              <p className="w-44 max-w-44 min-w-44" id="column-name" role="columnheader">
                {t('nameColumnLabel')}
              </p>

              <p className="grow" id="column-pub-key" role="columnheader">
                {t('pubKeyColumnLabel')}
              </p>

              <p className="w-36 max-w-36 min-w-36" id="column-votes" role="columnheader">
                {t('votesColumnLabel')}
              </p>

              <p
                className="w-10 max-w-10 min-w-10"
                id="column-actions"
                role="columnheader"
                aria-label={t('actionsColumnLabel')}
              />

              <p
                className="flex w-24 max-w-24 min-w-24 items-center gap-x-2 pl-2 uppercase"
                id="column-cast-vote"
                role="columnheader"
              >
                {t('castVoteColumnLabel')}

                {!!voteErrorMessage && (
                  <Tooltip
                    title={voteErrorMessage}
                    variant="black"
                    delayDuration={0}
                    contentProps={{ className: 'max-w-32' }}
                  >
                    <span>
                      <TbAlertTriangleFilled aria-hidden className="text-pink h-5 w-5" />
                    </span>
                  </Tooltip>
                )}
              </p>
            </div>

            <ul className="flex min-h-0 w-full flex-col" role="rowgroup">
              {filteredCandidates.map((candidate, index, array) => (
                <VoteNeo3ListItem
                  key={candidate.pubKey}
                  index={index}
                  neo3Account={neo3Account}
                  candidate={candidate}
                  pubKeySize={pubKeySize}
                  votesTotal={votesTotal}
                  voteErrorMessage={voteErrorMessage}
                  canVote={canVote}
                  candidatesLength={array.length}
                />
              ))}
            </ul>
          </div>
        ))}
    </div>
  )
}
