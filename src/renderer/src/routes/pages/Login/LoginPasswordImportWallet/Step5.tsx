import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Link } from '@renderer/components/Link'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

const LoginPasswordImportWalletStep5Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step5' })

  return (
    <Fragment>
      <div className="flex grow flex-col items-center">
        <p className="mt-15 text-sm text-white">{t('title')}</p>

        <TbRosetteDiscountCheck aria-hidden className="text-blue mt-3 h-25 w-25 stroke-1" />
      </div>

      <div className="flex gap-2.5">
        <ButtonDownloadPasswordQRCode />
        <Link
          to="/wallets"
          label={t('openWalletButtonLabel')}
          rightIcon={<MdOutlineAutoAwesome />}
          variant="contained"
          className="w-44"
          iconsOnEdge={false}
        />
      </div>
    </Fragment>
  )
}

export default LoginPasswordImportWalletStep5Page
