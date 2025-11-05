import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'

import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { useHasMigratePendingTransactionSelector } from './useUtilitySelector'

type TCanMigrateToNeo3Params = {
  tokenBalances?: TTokenBalance[]
}

export const useMigrationNeo3Validations = (account: IAccountState) => {
  const { networkRef } = useSelectedNetworkSelector(account.blockchain)
  const { hasMigratePendingTransactionRef } = useHasMigratePendingTransactionSelector(account)

  const neoLegacyService = bsAggregator.blockchainServicesByName[
    account.blockchain
  ] as BSNeoLegacy<TBlockchainServiceKey>

  const canMigrateToNeo3 = ({ tokenBalances }: TCanMigrateToNeo3Params) => {
    if (
      !tokenBalances ||
      hasMigratePendingTransactionRef.current ||
      neoLegacyService.name !== 'neoLegacy' ||
      networkRef.current.type !== 'mainnet'
    )
      return false

    const { hasEnoughGasBalance, hasEnoughNeoBalance } =
      neoLegacyService.neo3NeoLegacyMigrationService.calculateNeoLegacyMigrationAmounts(tokenBalances)

    return hasEnoughGasBalance || hasEnoughNeoBalance
  }

  return { canMigrateToNeo3, neoLegacyService }
}
