import { useTranslation } from 'react-i18next'

export const HardwareWalletConnectedBadge = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })

  return (
    <p className="h-min rounded-full border border-blue/30 px-4 py-1.5 text-xs text-blue">
      {t('hardwareWalletConnectBadge')}
    </p>
  )
}
