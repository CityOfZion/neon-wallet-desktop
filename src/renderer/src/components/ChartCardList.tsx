import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Loader } from '@renderer/components/Loader'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { usePriceHistory } from '@renderer/hooks/usePriceHistory'

import { TTokenBalance } from '@shared/types/query'

import { ChartCard } from './ChartCard'

type TProps = {
  sortedBalances: TTokenBalance[]
  className?: string
}

export const ChartCardList = ({ sortedBalances, className }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'chartCardList' })

  const priceHistories = usePriceHistory(
    sortedBalances.filter(
      (item, index, array) =>
        array.findIndex(({ token, blockchain }) => {
          return token.symbol === item.token.symbol && token.hash === item.token.hash && blockchain === item.blockchain
        }) === index
    )
  )

  if (!priceHistories.isLoading && priceHistories.data.length === 0) return null

  return (
    <div className={StyleHelper.mergeStyles('w-full py-9', className)}>
      {priceHistories.isLoading ? (
        <Loader className="size-10" />
      ) : (
        <Fragment>
          <span className="mb-3 text-sm text-gray-100">{t('title')}</span>

          <div className="flex w-full gap-2">
            {priceHistories.data
              .slice(0, 4)
              .map(item => item && <ChartCard priceHistory={item} key={item.tokenBalance.token.symbol} />)}
          </div>
        </Fragment>
      )}
    </div>
  )
}
