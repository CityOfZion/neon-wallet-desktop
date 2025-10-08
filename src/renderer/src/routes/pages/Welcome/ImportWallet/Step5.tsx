import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Link } from '@renderer/components/Link'

export const WelcomeImportWalletStep5Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step5' })

  return (
    <Fragment>
      <div className="flex flex-grow flex-col items-center">
        <p className="mt-15 text-sm text-white">{t('title')}</p>

        <TbRosetteDiscountCheck aria-hidden={true} className="mt-3 h-[6.25rem] w-[6.25rem] stroke-1 text-blue" />
      </div>

      <div className="flex gap-2.5">
        <ButtonDownloadPasswordQRCode />
        <Link
          to="/app/wallets"
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
