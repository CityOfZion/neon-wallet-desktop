import { useTranslation } from 'react-i18next'

export const HardwareWalletConnectedBadge = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })

  return (
    <p className="border-blue/30 text-blue h-min rounded-full border px-4 py-1.5 text-xs">
      {t('hardwareWalletConnectBadge')}
    </p>
  )
}
