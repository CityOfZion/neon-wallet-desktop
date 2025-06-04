import { useTranslation } from 'react-i18next'
import { Loader } from '@renderer/components/Loader'

type TProps = {
  loading?: boolean
  fee?: number
}

export const Fee = ({ fee, loading }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.contractInvocation' })

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold">{t('feeLabel')}</span>

      <div className="min-w-0 gap-3 rounded bg-gray-700/60 py-2.5 pl-5 pr-4">
        {loading ? <Loader className="h-4 w-4" /> : <p>{`${fee} GAS`}</p>}
      </div>
    </div>
  )
}
