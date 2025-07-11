import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbSearch from '@renderer/assets/images/tb-search.svg?react'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'
import { VOTE_NEO3_COZ_PUB_KEY } from '@renderer/constants/public-keys'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useAccountsByBlockchainsSelector, useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useBalance } from '@renderer/hooks/useBalances'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMount } from '@renderer/hooks/useMount'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { useCanShowVoteNeo3SupportUsModalSelector } from '@renderer/hooks/useSettingsSelector'
import {
  useVoteNeo3CalculateVoteFee,
  useVoteNeo3GetCandidatesToVote,
  useVoteNeo3GetVoteDetailsByAddress,
  useVoteNeo3Validations,
} from '@renderer/hooks/useVoteNeo3'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { IAccountState } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

import { VoteNeo3AvailableVotes } from './VoteNeo3AvailableVotes'
import { VoteNeo3List } from './VoteNeo3List'
import { VoteNeo3SideBar } from './VoteNeo3SideBar'

type TLocationState = {
  defaultNeo3Account?: IAccountState
}

type TActionsData = {
  neo3Account?: IAccountState
  search: string
}

export const VoteNeo3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3' })
  const { accounts } = useAccountsSelector()
  const { accountsByBlockchains: neo3Accounts } = useAccountsByBlockchainsSelector(['neo3'])
  const { modalNavigate } = useModalNavigate()
  const { canShowVoteNeo3SupportUsModalRef } = useCanShowVoteNeo3SupportUsModalSelector()

  const {
    networkByBlockchain: { neo3: neo3Network },
  } = useSelectedNetworkByBlockchainSelector()

  const navigate = useNavigate()
  const location = useLocation() as Location<TLocationState | null>

  const canOpenVoteNeo3SupportUsModalRef = useRef(true)

  const isMainnet = NetworkHelper.isMainnet('neo3', neo3Network)
  const defaultNeo3Account = location.state?.defaultNeo3Account

  const {
    actionData: { neo3Account, search },
    setData,
    setDataFromEventWrapper,
  } = useActions<TActionsData>({ neo3Account: defaultNeo3Account, search: '' })

  // We are using VOTE_NEO3_COZ_PUB_KEY only to calculate the fee
  const calculateVoteFeeQuery = useVoteNeo3CalculateVoteFee({ neo3Account, candidatePubKey: VOTE_NEO3_COZ_PUB_KEY })
  const candidatesToVoteQuery = useVoteNeo3GetCandidatesToVote()
  const voteDetailsByAddressQuery = useVoteNeo3GetVoteDetailsByAddress(neo3Account?.address)
  const balanceQuery = useBalance(neo3Account)
  const { hasEnoughGasToPayFee } = useVoteNeo3Validations({ balanceQuery, gasFee: calculateVoteFeeQuery.data })

  const cozCandidate = useMemo(
    () => candidatesToVoteQuery.data?.find(candidate => candidate.pubKey === VOTE_NEO3_COZ_PUB_KEY),
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
  const neoAmount = voteDetailsByAddressQuery.data?.neoBalance ?? 0
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
    const accountId = defaultNeo3Account?.id || neo3Account?.id || neo3Accounts[0]?.id || accounts[0].id

    navigate(`/app/wallets/${accountId}/overview`)
  }

  const handleChangeNeo3Account = (neo3Account: IAccountState) => {
    canOpenVoteNeo3SupportUsModalRef.current = false

    setData({ neo3Account })
  }

  useMount(
    () => {
      if (
        !cozCandidate ||
        !canOpenVoteNeo3SupportUsModalRef.current ||
        !canShowVoteNeo3SupportUsModalRef.current ||
        voteDetailsByAddressQuery.isLoading ||
        VOTE_NEO3_COZ_PUB_KEY === voteDetailsByAddressQuery.data?.candidatePubKey ||
        !defaultNeo3Account
      )
        return

      canOpenVoteNeo3SupportUsModalRef.current = false

      modalNavigate('vote-neo3-support-us', { state: { neo3Account: defaultNeo3Account, cozCandidate } })
    },
    [voteDetailsByAddressQuery.isLoading, voteDetailsByAddressQuery.data, cozCandidate, defaultNeo3Account],
    500
  )

  return (
    <ContentLayout
      title={t('title')}
      contentClassName="mt-0"
      withSeparator={false}
      titleIcon={<TbChartBarPopular aria-hidden={true} />}
      rightComponent={
        <div className="flex items-center gap-x-2">
          <p className="text-sm text-white">
            {neo3Account?.name ?? t('noAccountSelectedLabel')}
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
      <section className="flex h-full min-h-0 w-full rounded bg-gray-800">
        <VoteNeo3SideBar />

        <div className="flex h-full min-h-0 w-full flex-col gap-y-6 px-4 pb-6 pt-1">
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
              leftIcon={<TbSearch aria-hidden className="h-5 max-h-5 min-h-5 w-5 min-w-5 max-w-5 text-neon" />}
              onChange={setDataFromEventWrapper('search')}
            />

            <VoteNeo3AvailableVotes
              neoAmount={neoAmount}
              voteErrorMessage={voteErrorMessage}
              hasNeoAmount={hasNeoAmount}
              neo3Account={neo3Account}
            />
          </div>

          <VoteNeo3List
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
