import { TTokenBalance, TUseBalancesResult } from '@renderer/@types/query'
import { NumberHelper } from '@renderer/helpers/NumberHelper'

export const useFilteredBalance = (balances: TUseBalancesResult) => {
  const tokensBalances = balances.data.map(balance => balance.tokensBalances).flat()

  return tokensBalances
    .filter(balance => balance.exchangeAmount > 0)
    .reduce((acc, balance) => {
      const repeated = acc.find(item => item.token.hash === balance.token.hash)
      if (repeated) {
        repeated.amountNumber += balance.amountNumber
        repeated.exchangeAmount += balance.exchangeAmount
        repeated.amount = NumberHelper.removeLeadingZero(repeated.amountNumber.toFixed(repeated.token.decimals))
        return acc
      }

      acc.push(balance)
      return acc
    }, [] as TTokenBalance[])
    .sort((token1, token2) => token2.exchangeAmount - token1.exchangeAmount)
}
