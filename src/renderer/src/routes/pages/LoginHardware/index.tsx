import { useTranslation } from 'react-i18next'
import { TbDeviceUsb, TbX } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { TemporaryLimitsBox } from '@renderer/components/TemporaryLimitsBox'
import { useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useLogin } from '@renderer/hooks/useLogin'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'

export const LoginHardwarePage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginHardware' })
  const navigate = useNavigate()
  const { loginWithHardwareWallet } = useLogin()

  const { status, connect } = useHardwareWalletByUsb()

  const handleConnect = async () => {
    const accounts = await connect()

    await loginWithHardwareWallet(accounts)
    navigate('/app/portfolio')
  }

  useMountUnsafe(() => {
    handleConnect()
  }, 500)

  return (
    <WelcomeWithTabsLayout tabItemSelected="hardware" contentClassName="px-9">
      <p className="text-center text-sm text-white">{t('title')}</p>

      <TemporaryLimitsBox className="mt-4" />

      {status === 'searching' && <SearchingLoader className="mt-20" label={t('searchingLabel')} />}

      {status === 'not-connected' && (
        <div className="mt-12 flex flex-col items-center gap-7">
          <AlertErrorBanner
            className="gap-2.5 text-sm"
            message={t('notConnectedMessage')}
            icon={<TbX aria-hidden={true} />}
          />

          <Button variant="text-slim" className="w-fit" label={t('searchAgainButtonLabel')} onClick={handleConnect} />
        </div>
      )}

      {status === 'connected' && (
        <AlertSuccessBanner
          className="mt-20 gap-2.5 text-sm"
          message={t('connectedMessage')}
          icon={<TbDeviceUsb aria-hidden={true} className="rotate-45" />}
        />
      )}
    </WelcomeWithTabsLayout>
  )
}
