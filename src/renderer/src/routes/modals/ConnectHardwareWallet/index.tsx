import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'

import { useCreateHardwareWallet, useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import NeonWalletFullImage from '@renderer/assets/images/neon-wallet-full.svg?react'
import TbDeviceUsb from '@renderer/assets/images/tb-device-usb.svg?react'
import TbX from '@renderer/assets/images/tb-x.svg?react'

const ConnectHardwareWalletModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'connectHardwareWallet' })
  const navigate = useNavigate()
  const { modalErase } = useModalNavigate()
  const { createHardwareWallet } = useCreateHardwareWallet()
  const { pathname } = useLocation()

  const { status, connect } = useHardwareWalletByUsb()

  const handleConnect = async () => {
    const accounts = await connect()

    const [firstAccount] = await createHardwareWallet(accounts)

    if (pathname.startsWith('/wallets/')) {
      navigate('/wallets/overview', { state: { account: firstAccount } })
    }

    modalErase()
  }

  useMountUnsafe(() => {
    handleConnect()
  }, 500)

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center justify-between" size="lg">
      <div className="flex flex-col items-center">
        <NeonWalletFullImage aria-hidden />

        <p className="mt-12 text-center text-2xl text-white">{t('title')}</p>

        <p className="mt-6 text-sm text-gray-100">{t('description')}</p>
      </div>

      {status === 'searching' && <SearchingLoader label={t('searchingLabel')} />}

      {status === 'not-connected' && (
        <AlertErrorBanner
          className="py-5s gap-2.5 text-sm"
          message={t('notConnectedMessage')}
          icon={<TbX aria-hidden />}
        />
      )}

      {status === 'connected' && (
        <AlertSuccessBanner
          className="gap-2.5 py-5 text-sm"
          message={t('connectedMessage')}
          icon={<TbDeviceUsb aria-hidden className="rotate-45" />}
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

export default ConnectHardwareWalletModal
