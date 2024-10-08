import { useTranslation } from 'react-i18next'
import { TbDeviceUsb, TbX } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { TemporaryLimitsBox } from '@renderer/components/TemporaryLimitsBox'
import { useConnectHardwareWallet } from '@renderer/hooks/useConnectHardwareWallet'
import { useLogin } from '@renderer/hooks/useLogin'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'

export const LoginHardwarePage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginHardware' })
  const navigate = useNavigate()
  const { loginWithHardwareWallet } = useLogin()

  const { status, handleTryConnect } = useConnectHardwareWallet(async info => {
    await loginWithHardwareWallet(info)
    navigate('/app/portfolio')
  })

  return (
    <WelcomeWithTabsLayout tabItemSelected="hardware" contentClassName="px-9">
      <p className="text-white text-sm text-center">{t('title')}</p>

      <TemporaryLimitsBox className="mt-4" />

      {status === 'searching' && <SearchingLoader className="mt-20" label={t('searchingLabel')} />}

      {status === 'not-connected' && (
        <div className="flex flex-col mt-12 gap-7 items-center">
          <AlertErrorBanner className="gap-2.5 text-sm" message={t('notConnectedMessage')} icon={<TbX />} />

          <Button
            variant="text-slim"
            className="w-fit"
            label={t('searchAgainButtonLabel')}
            onClick={handleTryConnect}
          />
        </div>
      )}

      {status === 'connected' && (
        <AlertSuccessBanner
          className="gap-2.5 mt-20 text-sm"
          message={t('connectedMessage')}
          icon={<TbDeviceUsb className="rotate-45" />}
        />
      )}
    </WelcomeWithTabsLayout>
  )
}
