import { useTranslation } from 'react-i18next'
import { TTokenBalance } from '@renderer/@types/query'

import { ChartCard } from './ChartCard'

type TProps = {
  tokenBalance: TTokenBalance[]
}

export const ChartCardList = ({ tokenBalance }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'chartCardList' })
  return (
    <div className="flex flex-col gap-y-4 px-4 items-start">
      <span className="text-sm text-gray-100">{t('title')}</span>

      <div className="flex gap-2 flex-wrap">
        {tokenBalance.map((item, index) => (
          <ChartCard token={item} key={index} />
        ))}
      </div>
    </div>
  )
}
