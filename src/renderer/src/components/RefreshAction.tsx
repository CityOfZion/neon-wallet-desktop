import { useTranslation } from 'react-i18next'

import { IconButton } from '@renderer/components/IconButton'

import { DateHelper } from '@renderer/helpers/DateHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useLastUpdated, useRefetch } from '@renderer/hooks/useQuery'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import TbRefresh from '@renderer/assets/images/tb-refresh.svg?react'

export const RefreshAction = () => {
  const { t } = useTranslation('components', { keyPrefix: 'refreshAction' })
  const { refetch, isRefetching } = useRefetch()
  const lastUpdated = useLastUpdated()
  const { language } = useLanguageSelector()

  return (
    <div className="flex items-center gap-x-2">
      {lastUpdated && (
        <p className="text-xs text-gray-300 italic">
          {t('lastUpdated', {
            date: isRefetching ? t('emptyDate') : DateHelper.formatLocalized(lastUpdated, { language, format: 'p' }),
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
