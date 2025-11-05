import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useLastUpdated, useRefetch } from '@renderer/hooks/useQuery'

import TbRefresh from '@renderer/assets/images/tb-refresh.svg?react'

export const RefreshAction = () => {
  const { t } = useTranslation('components', { keyPrefix: 'refreshAction' })
  const { refetch, isRefetching } = useRefetch()
  const lastUpdated = useLastUpdated()

  return (
    <div className="flex items-center gap-x-2">
      {lastUpdated && (
        <p className="text-xs text-gray-300 italic">
          {t('lastUpdated', {
            date: isRefetching ? t('emptyDate') : format(new Date(lastUpdated), t('dateFormat')),
          })}
        </p>
      )}

      <IconButton
        aria-label={t('refreshLabel')}
        size="sm"
        colorSchema="neon"
        compacted
        disabled={isRefetching}
        icon={<TbRefresh className={StyleHelper.mergeStyles({ 'animate-spin': isRefetching })} />}
        onClick={refetch}
      />
    </div>
  )
}
