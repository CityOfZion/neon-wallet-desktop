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
    sortedBalances
      .slice(0, 4)
      .filter((item, index, array) => array.findIndex(t => t.token.symbol === item.token.symbol) === index)
  )

  if (!priceHistories.isLoading && priceHistories.data.length === 0) return null

  return (
    <div className={StyleHelper.mergeStyles('w-full py-9', className)}>
      {priceHistories.isLoading ? (
        <Loader className="h-10 w-10" />
      ) : (
        <Fragment>
          <span className="mb-3.5 text-sm text-gray-100">{t('title')}</span>

          <div className="flex w-full justify-around gap-1.5">
            {priceHistories.data.map(
              item => item && <ChartCard priceHistory={item} key={item.tokenBalance.token.symbol} />
            )}
          </div>
        </Fragment>
      )}
    </div>
  )
}
