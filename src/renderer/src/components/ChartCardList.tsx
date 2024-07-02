import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { usePriceHistory } from '@renderer/hooks/usePriceHistory'
import { TTokenBalance } from '@shared/@types/query'

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

  return (
    <div className={StyleHelper.mergeStyles('w-full', className)}>
      {priceHistories.isLoading ? (
        <Loader className="w-10 h-10" />
      ) : (
        <Fragment>
          <span className="text-sm text-gray-100 mb-3.5">{t('title')}</span>

          <div className="flex gap-1.5 justify-around w-full">
            {priceHistories.data.map(
              item => item && <ChartCard priceHistory={item} key={item.tokenBalance.token.symbol} />
            )}
          </div>
        </Fragment>
      )}
    </div>
  )
}
