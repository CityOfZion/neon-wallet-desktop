import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Loader } from '@renderer/components/Loader'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { type TPriceHistory } from '@shared/types/query'

import { ChartCard } from './ChartCard'

type TProps = {
  priceHistory: TPriceHistory[]
  isLoading?: boolean
  className?: string
}

export const ChartCardList = ({ priceHistory, isLoading, className }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'chartCardList' })

  return (
    <div className={StyleHelper.mergeStyles('w-full py-9', className)}>
      {isLoading ? (
        <Loader className="size-10" />
      ) : (
        <Fragment>
          <span className="mb-3 text-sm text-gray-100">{t('title')}</span>

          <div className="flex w-full gap-2">
            {priceHistory.slice(0, 4).map(item => (
              <ChartCard
                key={TokenHelper.getKey(item.tokenBalance.token.hash, item.tokenBalance.blockchain)}
                priceHistory={item}
              />
            ))}
          </div>
        </Fragment>
      )}
    </div>
  )
}
