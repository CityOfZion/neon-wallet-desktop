import { useMemo, useRef } from 'react'

import type { TBSNeo3Name } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'
import { match, P } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useAccountsByBlockchainsSelector, useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMount } from '@renderer/hooks/useMount'
import {
  useNeo3VoteCalculateVoteFee,
  useNeo3VoteGetCandidatesToVote,
  useNeo3VoteGetVoteDetailsByAddress,
  useNeo3VoteValidations,
} from '@renderer/hooks/useNeo3Vote'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { useCanShowNeo3VoteSupportUsModalSelector } from '@renderer/hooks/useSettingsSelector'

import { ContentLayout } from '@renderer/layouts/ContentLayout'

import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbSearch from '@renderer/assets/images/tb-search.svg?react'

import { TAccount } from '@shared/types/store'

import { Neo3VoteAvailableVotes } from './Neo3VoteAvailableVotes'
import { Neo3VoteList } from './Neo3VoteList'
import { Neo3VoteSideBar } from './Neo3VoteSideBar'

type TLocationState = {
  defaultNeo3Account?: TAccount<TBSNeo3Name>
}

type TActionsData = {
  neo3Account?: TAccount<TBSNeo3Name>
  search: string
}

const Neo3VotePage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'neo3Vote' })
  const { accounts } = useAccountsSelector()
  const { accountsByBlockchains: neo3Accounts } = useAccountsByBlockchainsSelector(['neo3'])
  const { modalNavigate } = useModalNavigate()
  const { canShowNeo3VoteSupportUsModalRef } = useCanShowNeo3VoteSupportUsModalSelector()

  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const navigate = useNavigate()
  const location = useLocation() as Location<TLocationState | null>

  const canOpenNeo3VoteSupportUsModalRef = useRef(true)

  const isMainnet = neo3Network.type === 'mainnet'
  const defaultNeo3Account = location.state?.defaultNeo3Account

  const {
    actionData: { neo3Account, search },
    setData,
    setDataFromEventWrapper,
  } = useActions<TActionsData>({ neo3Account: defaultNeo3Account, search: '' })

  // We are using ConstantsHelper.neo3VoteCozPubKey only to calculate the fee
  const calculateVoteFeeQuery = useNeo3VoteCalculateVoteFee({
    neo3Account,
    candidatePubKey: ConstantsHelper.neo3VoteCozPubKey,
  })
  const candidatesToVoteQuery = useNeo3VoteGetCandidatesToVote()
  const voteDetailsByAddressQuery = useNeo3VoteGetVoteDetailsByAddress(neo3Account?.address)
  const balanceQuery = useBalance(neo3Account)
  const { hasEnoughGasToPayFee } = useNeo3VoteValidations({ balanceQuery, gasFee: calculateVoteFeeQuery.data })

  const cozCandidate = useMemo(
    () => candidatesToVoteQuery.data?.find(candidate => candidate.pubKey === ConstantsHelper.neo3VoteCozPubKey),
    [candidatesToVoteQuery.data]
  )

  const isLoading =
    calculateVoteFeeQuery.isLoading ||
    candidatesToVoteQuery.isLoading ||
    voteDetailsByAddressQuery.isLoading ||
    balanceQuery.isLoading

  const hasNeo3Accounts = neo3Accounts.length > 0
  const isAccountSelectionDisabled = isLoading || !hasNeo3Accounts || !isMainnet
  const isSearchDisabled = candidatesToVoteQuery.isLoading || !hasNeo3Accounts || !isMainnet
  const isWatchAccount = neo3Account?.type === 'watch'
  const neoAmount = voteDetailsByAddressQuery.data?.neoBalance || 0
  const hasNeoAmount = neoAmount > 0
  const canVote = !isLoading && isMainnet && !isWatchAccount && hasNeoAmount && !!hasEnoughGasToPayFee

  const voteErrorMessage = match({ neo3Account, hasNeoAmount, isMainnet, isWatchAccount, hasEnoughGasToPayFee })
    .with({ neo3Account: P.when(value => !value) }, () => t('voteErrorMessages.selectNeo3AccountLabel'))
    .with({ isMainnet: false }, () => t('voteErrorMessages.shouldUseMainnetLabel'))
    .with({ hasNeoAmount: false }, () => t('voteErrorMessages.thereIsNoNeoLabel'))
    .with({ isWatchAccount: true }, () => t('voteErrorMessages.accountCanNotBeWatchLabel'))
    .with({ hasEnoughGasToPayFee: false }, () => t('voteErrorMessages.shouldHaveEnoughGasToPayFeeLabel'))
    .otherwise(() => undefined)

  const handleGoBack = () => {
    const account = defaultNeo3Account || neo3Account || neo3Accounts[0] || accounts[0]

    navigate('/wallets/overview', { state: { account } })
  }

  const handleChangeNeo3Account = (neo3Account: TAccount<TBSNeo3Name>) => {
    canOpenNeo3VoteSupportUsModalRef.current = false
    setData({ neo3Account })
  }

  useMount(
    () => {
      if (
        !cozCandidate ||
        !canOpenNeo3VoteSupportUsModalRef.current ||
        !canShowNeo3VoteSupportUsModalRef.current ||
        voteDetailsByAddressQuery.isLoading ||
        ConstantsHelper.neo3VoteCozPubKey === voteDetailsByAddressQuery.data?.candidatePubKey ||
        !defaultNeo3Account
      )
        return

      canOpenNeo3VoteSupportUsModalRef.current = false

      modalNavigate('neo3-vote-support-us', { replace: true, state: { neo3Account: defaultNeo3Account, cozCandidate } })
    },
    [voteDetailsByAddressQuery.isLoading, voteDetailsByAddressQuery.data, cozCandidate, defaultNeo3Account],
    500
  )

  return (
    <ContentLayout
      title={t('title')}
      contentClassName="mt-0"
      withSeparator={false}
      titleIcon={<TbChartBarPopular aria-hidden />}
      rightComponent={
        <div className="flex items-center gap-x-2">
          <p className="text-sm text-white">
            {neo3Account?.name || t('noAccountSelectedLabel')}
            {neo3Account && (
              <span className="text-gray-100"> | {StringHelper.truncateStringMiddle(neo3Account.address, 8)}</span>
            )}
          </p>

          <GreyAccountSelect
            selectedAccount={neo3Account}
            blockchains={['neo3']}
            accountTypes={['standard', 'hardware', 'watch']}
            disabled={isAccountSelectionDisabled}
            onSelect={handleChangeNeo3Account}
          >
            <div>
              <Tooltip
                title={hasNeo3Accounts ? '' : t('createNeo3AccountLabel')}
                variant="black"
                delayDuration={0}
                contentProps={{ className: 'max-w-32' }}
              >
                <Button
                  label={neo3Account ? t('changeNeo3AccountLabel') : t('selectNeo3AccountLabel')}
                  type="button"
                  textClassName="text-sm"
                  variant="text-slim"
                  disabled={isAccountSelectionDisabled}
                />
              </Tooltip>
            </div>
          </GreyAccountSelect>
        </div>
      }
      onBackClick={handleGoBack}
    >
      <section className="flex h-full min-h-0 w-full rounded-sm bg-gray-800">
        <Neo3VoteSideBar />

        <div className="flex h-full min-h-0 w-full flex-col gap-y-6 px-4 pt-1 pb-6">
          <div className="flex w-full flex-col">
            <h2 className="flex h-12 w-full items-center text-sm text-white">{t('subtitle')}</h2>

            <Separator />
          </div>

          <div className="flex w-full items-center justify-between gap-x-4 pr-4">
            <Input
              aria-label={t('searchLabel')}
              placeholder={t('searchPlaceholder')}
              className="placeholder:text-gray-100"
              contentClassName="h-10"
              containerClassName="w-full max-w-96"
              clearable
              maxLength={100}
              value={search}
              disabled={isSearchDisabled}
              leftIcon={<TbSearch aria-hidden className="text-neon max-size-5 min-size-5 size-5" />}
              onChange={setDataFromEventWrapper('search')}
            />

            <Neo3VoteAvailableVotes
              neoAmount={neoAmount}
              voteErrorMessage={voteErrorMessage}
              hasNeoAmount={hasNeoAmount}
              neo3Account={neo3Account}
            />
          </div>

          <Neo3VoteList
            neo3Account={neo3Account}
            search={search}
            voteErrorMessage={voteErrorMessage}
            canVote={canVote}
          />
        </div>
      </section>
    </ContentLayout>
  )
}

export default Neo3VotePage
