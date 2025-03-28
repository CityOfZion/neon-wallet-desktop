import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TTokenBalance, TUseUnclaimedResult } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { useHasClaimPendingTransactionSelector, useHasMigratePendingTransactionSelector } from './useUtilitySelector'

type TCanMigrateToNeo3Params = {
  tokenBalances?: TTokenBalance[]
  unclaimedResult?: TUseUnclaimedResult
}

export const useMigrationNeo3Validations = (account: IAccountState) => {
  const { networkRef } = useSelectedNetworkSelector(account.blockchain)
  const { hasClaimPendingTransactionRef } = useHasClaimPendingTransactionSelector(account)
  const { hasMigratePendingTransactionRef } = useHasMigratePendingTransactionSelector(account)

  const neoLegacyService = bsAggregator.blockchainServicesByName[
    account.blockchain
  ] as BSNeoLegacy<TBlockchainServiceKey>

  const shouldClaimBeforeMigrateToNeo3 = (unclaimedResult: TUseUnclaimedResult) => {
    if (neoLegacyService.name !== 'neoLegacy') return false

    const hasUnclaimed = unclaimedResult.unclaimedNumber > 0
    const isUnclaimedGreaterThanFee = unclaimedResult.unclaimedNumber > unclaimedResult.feeNumber

    if (!hasUnclaimed || !isUnclaimedGreaterThanFee) return false

    return hasUnclaimed && isUnclaimedGreaterThanFee
  }

  const canMigrateToNeo3 = ({ tokenBalances, unclaimedResult }: TCanMigrateToNeo3Params) => {
    if (
      neoLegacyService.name !== 'neoLegacy' ||
      hasClaimPendingTransactionRef.current ||
      hasMigratePendingTransactionRef.current ||
      !NetworkHelper.isMainnet(neoLegacyService.name, networkRef.current) ||
      !tokenBalances
    )
      return false

    const { hasEnoughGasBalance, hasEnoughNeoBalance } =
      neoLegacyService.calculateNeoLegacyMigrationAmounts(tokenBalances)
    const hasSomeTokenToMigrate = hasEnoughGasBalance || hasEnoughNeoBalance
    if (!hasSomeTokenToMigrate) return false

    if (!unclaimedResult) return false

    return !shouldClaimBeforeMigrateToNeo3(unclaimedResult)
  }

  return { shouldClaimBeforeMigrateToNeo3, canMigrateToNeo3, neoLegacyService }
}
