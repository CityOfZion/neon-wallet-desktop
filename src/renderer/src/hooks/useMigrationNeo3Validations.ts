import { hasMigrationNeo3 } from '@cityofzion/blockchain-service'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { usePendingTransactionsSelector } from '@renderer/hooks/useAuthSelector'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

type TCanMigrateToNeo3Params = {
  tokenBalances: TTokenBalance[]
}

type TMigrateToNeo3Params = {
  account: IAccountState
}

export const useMigrationNeo3Validations = ({ account }: TMigrateToNeo3Params) => {
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { pendingTransactions } = usePendingTransactionsSelector()

  const service = bsAggregator.blockchainServicesByName[account.blockchain]

  const hasGasAmount = (amount: number) => amount >= 0.1

  const hasNeoAmount = (amount: number) => amount >= 2

  const canMigrateToNeo3 = ({ tokenBalances }: TCanMigrateToNeo3Params) => {
    const gasAmount = tokenBalances.find(({ token }) => token.symbol === 'GAS')?.amountNumber ?? 0
    const neoAmount = tokenBalances.find(({ token }) => token.symbol === 'NEO')?.amountNumber ?? 0

    return (
      hasMigrationNeo3(service) &&
      (hasGasAmount(gasAmount) || hasNeoAmount(neoAmount)) &&
      !pendingTransactions.some(
        ({ fromAccount, to }) =>
          !!fromAccount &&
          AccountHelper.predicate(fromAccount)(account) &&
          to === BSNeoLegacyConstants.MIGRATION_NEO3_COZ_ADDRESS
      ) &&
      NetworkHelper.isMainnet(service.name, network)
    )
  }

  return { canMigrateToNeo3, hasGasAmount, hasNeoAmount }
}
