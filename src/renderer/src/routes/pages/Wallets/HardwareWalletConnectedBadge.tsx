import { useTranslation } from 'react-i18next'

export const HardwareWalletConnectedBadge = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })

  return (
    <p className="text-xs text-blue py-1.5 h-min px-4 border border-blue/30 rounded-full">
      {t('hardwareWalletConnectBadge')}
    </p>
  )
}
