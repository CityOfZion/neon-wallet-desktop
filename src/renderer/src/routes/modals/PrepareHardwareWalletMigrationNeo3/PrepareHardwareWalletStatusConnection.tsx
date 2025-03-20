import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdSearch } from 'react-icons/md'
import { TbDeviceUsb, TbHourglass, TbX } from 'react-icons/tb'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { TConnectHardwareWalletResponse } from '@renderer/hooks/useHardwareWallet'
import { match } from 'ts-pattern'

type TProps = {
  searchLabel: string
  connectHardwareWallet: TConnectHardwareWalletResponse
}

export const PrepareHardwareWalletStatusConnection = ({
  searchLabel,
  connectHardwareWallet: { status, handleTryConnect },
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })

  return match(status)
    .with('connected', () => (
      <AlertSuccessBanner
        className="gap-2 text-sm py-4 my-4"
        message={t('labels.connected')}
        icon={<TbDeviceUsb aria-hidden={true} className="rotate-45" />}
      />
    ))
    .with('not-connected', () => (
      <Fragment>
        <AlertErrorBanner
          className="gap-2 text-sm py-4 mt-4"
          message={t('labels.hardwareWalletNotFound')}
          icon={<TbX aria-hidden={true} />}
        />

        <Button
          label={t('buttons.searchAgain')}
          variant="card"
          textClassName="text-neon"
          iconsOnEdge={false}
          leftIcon={<MdSearch aria-hidden={true} className="text-neon w-5 h-5" />}
          clickableProps={{ className: 'px-6 py-0 h-10' }}
          onClick={handleTryConnect}
        />
      </Fragment>
    ))
    .otherwise(() => (
      <SearchingLoader
        label={searchLabel}
        className="before:bg-gradient-to-r before:to-[50%] mt-2"
        contentClassName="px-6 gap-4"
        icon={<TbHourglass aria-hidden={true} className="w-6 h-6" />}
      />
    ))
}
