import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@renderer/hooks/useRedux'

export const HardwareWalletConnectedBadge = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })
  const { value } = useAppSelector(state => state.account.data.some(account => account.type === 'hardware'))

  if (!value) return null

  return (
    <p className="text-xs text-blue py-1.5 h-min px-4 border border-blue/30 rounded-full">
      {t('hardwareWalletConnectBadge')}
    </p>
  )
}
