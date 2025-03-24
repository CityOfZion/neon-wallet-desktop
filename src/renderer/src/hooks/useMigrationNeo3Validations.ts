import { hasMigrationNeo3 } from '@cityofzion/blockchain-service'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TTokenBalance, TUseUnclaimedResult } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { useHasClaimPendingTransactionSelector, usePendingTransactionsSelector } from './useUtilitySelector'

type TShouldClaimBeforeMigrateToNeo3Params = {
  tokenBalances: TTokenBalance[]
  unclaimedResult: TUseUnclaimedResult
}

type TCanMigrateToNeo3Params = {
  tokenBalances: TTokenBalance[]
  unclaimedResult?: TUseUnclaimedResult
}

type TMigrateToNeo3Params = {
  account: IAccountState
}

export const useMigrationNeo3Validations = ({ account }: TMigrateToNeo3Params) => {
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { pendingTransactionsRef } = usePendingTransactionsSelector()
  const { hasClaimPendingTransactionRef } = useHasClaimPendingTransactionSelector(account)

  const service = bsAggregator.blockchainServicesByName[account.blockchain]

  const hasGasAmount = (amount: number) => amount >= 0.1

  const hasNeoAmount = (amount: number) => amount >= 2

  const shouldClaimBeforeMigrateToNeo3 = ({
    tokenBalances,
    unclaimedResult,
  }: TShouldClaimBeforeMigrateToNeo3Params) => {
    const normalizedFeeTokenHash = UtilsHelper.normalizeHash(service.feeToken.hash)
    const feeTokenBalance = tokenBalances.find(
      ({ token }) => UtilsHelper.normalizeHash(token.hash) === normalizedFeeTokenHash
    )

    return (
      unclaimedResult.unclaimedNumber > 0 &&
      unclaimedResult.unclaimedNumber > unclaimedResult.feeNumber &&
      (unclaimedResult.feeNumber === 0 ||
        (!!feeTokenBalance && feeTokenBalance.amountNumber > unclaimedResult.feeNumber))
    )
  }

  const canMigrateToNeo3 = ({ tokenBalances, unclaimedResult }: TCanMigrateToNeo3Params) => {
    const gasAmount = tokenBalances.find(({ token }) => token.symbol === 'GAS')?.amountNumber ?? 0
    const neoAmount = tokenBalances.find(({ token }) => token.symbol === 'NEO')?.amountNumber ?? 0
    let shouldClaim = false

    if (unclaimedResult) shouldClaim = shouldClaimBeforeMigrateToNeo3({ tokenBalances, unclaimedResult })

    return (
      hasMigrationNeo3(service) &&
      !hasClaimPendingTransactionRef.current &&
      !shouldClaim &&
      (hasGasAmount(gasAmount) || hasNeoAmount(neoAmount)) &&
      !pendingTransactionsRef.current.some(
        ({ fromAccount, to }) =>
          !!fromAccount &&
          AccountHelper.predicate(fromAccount)(account) &&
          to === BSNeoLegacyConstants.MIGRATION_NEO3_COZ_ADDRESS
      ) &&
      NetworkHelper.isMainnet(service.name, network)
    )
  }

  return { hasGasAmount, hasNeoAmount, shouldClaimBeforeMigrateToNeo3, canMigrateToNeo3 }
}
