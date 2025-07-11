import { useTranslation } from 'react-i18next'
import TbDeviceUsb from '@renderer/assets/images/tb-device-usb.svg?react'
import TbHourglass from '@renderer/assets/images/tb-hourglass.svg?react'
import TbX from '@renderer/assets/images/tb-x.svg?react'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { TUseHardwareWalletByUsbStatus } from '@shared/@types/hooks'
import { match } from 'ts-pattern'

type TProps = {
  searchLabel: string
  status: TUseHardwareWalletByUsbStatus
}

export const PrepareHardwareWalletStatusConnection = ({ searchLabel, status }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.statusConnection' })

  return (
    <div className="my-2 flex flex-grow items-center">
      {match(status)
        .with('connected', () => (
          <AlertSuccessBanner
            className="gap-2 py-4 text-sm"
            message={t('connectedMessage')}
            icon={<TbDeviceUsb aria-hidden={true} className="rotate-45" />}
          />
        ))
        .with('not-connected', () => (
          <AlertErrorBanner
            className="gap-2 py-4 text-sm"
            message={t('notFoundMessage')}
            icon={<TbX aria-hidden={true} />}
          />
        ))
        .otherwise(() => (
          <SearchingLoader label={searchLabel} icon={<TbHourglass aria-hidden={true} className="h-6 w-6" />} />
        ))}
    </div>
  )
}
