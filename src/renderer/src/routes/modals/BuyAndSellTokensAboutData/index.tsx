import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import SumsubLogo from '@renderer/assets/images/sumsub-logo.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'
import UnlimitLogo from '@renderer/assets/images/unlimit-logo.svg?react'

import { SUMSUB_TERMS_AND_CONDITIONS_LINK, UNLIMIT_USE_TERMS_LINK } from '@renderer/constants/urls'

type TLinkItemProps = {
  title: string
  to: string
  linkLabel: string
  svgImage: ReactNode
}

const LinkItem = ({ title, to, linkLabel, svgImage }: TLinkItemProps) => (
  <li className="flex flex-col items-center gap-y-5">
    <h3>{title}</h3>

    <div className="flex h-14 max-h-14 w-48 max-w-48 items-center justify-center rounded-full bg-gray-300/15">
      {svgImage}
    </div>

    <Link
      label={linkLabel}
      to={to}
      target="_blank"
      colorSchema="neon"
      variant="text-slim"
      flat
      className="w-fit"
      iconsOnEdge={false}
      rightIcon={<TbExternalLink aria-hidden />}
    />

    <Separator />
  </li>
)

const BuyAndSellTokensAboutDataModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'buyAndSellTokensAboutData' })

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdInfoOutline aria-hidden />}
      contentClassName="flex flex-col gap-y-5 overflow-y-auto text-xs text-white py-6"
    >
      <ul className="flex w-full flex-col gap-y-5">
        <LinkItem
          title={t('sumbsub.title')}
          to={SUMSUB_TERMS_AND_CONDITIONS_LINK}
          linkLabel={t('sumbsub.link')}
          svgImage={<SumsubLogo aria-hidden className="h-full" />}
        />

        <LinkItem
          title={t('unlimit.title')}
          to={UNLIMIT_USE_TERMS_LINK}
          linkLabel={t('unlimit.link')}
          svgImage={<UnlimitLogo aria-hidden className="h-full" />}
        />
      </ul>

      <p>{t('description')}</p>

      <AlertErrorBanner className="bg-magenta-700/50 gap-3 p-3" message={t('alert')} messageClassName="font-normal" />
    </SideModalLayout>
  )
}

export default BuyAndSellTokensAboutDataModal
