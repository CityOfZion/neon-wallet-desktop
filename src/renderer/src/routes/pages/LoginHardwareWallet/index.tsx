import { useTranslation } from 'react-i18next'
import { TbDeviceUsb, TbX } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { useConnectHardwareWallet } from '@renderer/hooks/useConnectHardwareWallet'
import { useLogin } from '@renderer/hooks/useLogin'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'
import { EWelcomeTabItemType } from '@renderer/layouts/WelcomeWithTabs/WelcomeTabs'

export const LoginHardwareWalletPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginHardwareWallet' })
  const navigate = useNavigate()
  const { loginWithHardwareWallet } = useLogin()

  const { status, handleTryConnect } = useConnectHardwareWallet(async info => {
    await loginWithHardwareWallet(info)
    navigate('/app/portfolio')
  })

  const limits = t('limits', { returnObjects: true })

  return (
    <WelcomeWithTabsLayout tabItemType={EWelcomeTabItemType.HARDWARE_WALLET} contentClassName="px-9">
      <p className="text-white text-sm text-center">{t('title')}</p>

      <p className="text-gray-100 text-xs mt-4">{t('description')}</p>

      <div className="bg-gray-900/50 px-10 py-2 rounded w-full mt-3.5 grid grid-cols-2 gap-y-2.5">
        {limits.map((limit, index) => (
          <div className="flex gap-1.5 items-center" key={`limits-${index}`}>
            <TbX className="text-pink w-4 h-4 stroke-[3px]" />
            <p className="text-xs text-gray-100 relative -top-px">{limit}</p>
          </div>
        ))}
      </div>

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
