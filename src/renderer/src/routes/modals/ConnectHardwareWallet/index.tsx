import { useTranslation } from 'react-i18next'
import { TbDeviceUsb, TbX } from 'react-icons/tb'
import { useLocation, useNavigate } from 'react-router-dom'
import NeonWalletFullImage from '@renderer/assets/images/neon-wallet-full.svg?react'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { useHardwareWalletActions, useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

export const ConnectHardwareWalletModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'connectHardwareWallet' })
  const navigate = useNavigate()
  const { modalErase } = useModalNavigate()
  const { createHardwareWallet } = useHardwareWalletActions()
  const { pathname } = useLocation()

  const { status, connect } = useHardwareWalletByUsb()

  const handleConnect = async () => {
    const accounts = await connect()

    const [firstAccount] = await createHardwareWallet(accounts)

    if (pathname.startsWith('/app/wallets/')) navigate(`/app/wallets/${firstAccount.id}/overview`)

    modalErase('center')
  }

  useMountUnsafe(() => {
    handleConnect()
  }, 500)

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <NeonWalletFullImage />

        <p className="text-white text-2xl text-center mt-12">{t('title')}</p>

        <p className="text-gray-100 text-sm mt-6">{t('description')}</p>
      </div>

      {status === 'searching' && <SearchingLoader label={t('searchingLabel')} />}

      {status === 'not-connected' && (
        <AlertErrorBanner className="gap-2.5 text-sm py-5s" message={t('notConnectedMessage')} icon={<TbX />} />
      )}

      {status === 'connected' && (
        <AlertSuccessBanner
          className="gap-2.5 text-sm py-5"
          message={t('connectedMessage')}
          icon={<TbDeviceUsb className="rotate-45" />}
        />
      )}

      <Button
        label={t('searchAgainButtonLabel')}
        className="w-64"
        disabled={status !== 'not-connected'}
        onClick={handleConnect}
      />
    </CenterModalLayout>
  )
}
