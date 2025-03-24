import { useMemo } from 'react'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { TTokenBalance, TUseBalanceOptionShowType } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

export const useData = (accounts: IAccountState[], showType: TUseBalanceOptionShowType) => {
  const balances = useBalances(accounts, { showType })

  const data = useMemo(() => {
    if (!balances.data) return []

    const groupedTokens = new Map<string, TTokenBalance>()

    balances.data.forEach(balance =>
      balance.tokensBalances.forEach(tokenBalance => {
        if (isNaN(tokenBalance.amountNumber) || tokenBalance.amountNumber <= 0) return

        const groupedToken = groupedTokens.get(tokenBalance.token.hash)

        if (!groupedToken) {
          groupedTokens.set(tokenBalance.token.hash, tokenBalance)
          return
        }

        groupedToken.amountNumber += tokenBalance.amountNumber
        groupedToken.amount = NumberHelper.removeLeadingZero(
          groupedToken.amountNumber.toFixed(tokenBalance.token.decimals)
        )
        groupedToken.exchangeAmount += tokenBalance.exchangeAmount
      })
    )

    return Array.from(groupedTokens.values())
  }, [balances.data])

  return {
    data,
    isLoading: balances.isLoading,
  }
}
