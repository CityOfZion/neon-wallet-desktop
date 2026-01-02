import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Link } from '@renderer/components/Link'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

export const LoginPasswordImportWalletStep5Content = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.completedStep' })

  return (
    <Fragment>
      <div className="flex grow flex-col items-center">
        <p className="mt-15 text-sm text-white">{t('title')}</p>

        <TbRosetteDiscountCheck aria-hidden className="text-blue mt-3 h-25 w-25 stroke-1" />
      </div>

      <div className="mt-2 flex flex-col gap-3 px-4">
        <ButtonDownloadPasswordQRCode />

        <Link
          to="/wallets/overview"
          label={t('openWalletButtonLabel')}
          rightIcon={<MdOutlineAutoAwesome aria-hidden />}
          variant="contained"
          iconsOnEdge={false}
        />
      </div>
    </Fragment>
  )
}
