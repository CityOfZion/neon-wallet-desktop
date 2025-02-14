import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MdInfoOutline, MdLaunch } from 'react-icons/md'
import SumsubLogo from '@renderer/assets/images/sumsub-logo.svg?react'
import UnlimitLogo from '@renderer/assets/images/unlimit-logo.svg?react'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { SUMSUB_TERMS_AND_CONDITIONS_LINK, UNLIMIT_USE_TERMS_LINK } from '@renderer/constants/urls'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TLinkItemProps = {
  title: string
  to: string
  linkLabel: string
  svgImage: ReactNode
}

const LinkItem = ({ title, to, linkLabel, svgImage }: TLinkItemProps) => (
  <li className="flex flex-col items-center gap-y-5">
    <h3>{title}</h3>

    <div className="max-w-48 w-48 max-h-14 h-14 rounded-full bg-gray-300/15 flex items-center justify-center">
      {svgImage}
    </div>

    <Link
      label={linkLabel}
      to={to}
      target="_blank"
      colorSchema="neon"
      variant="text-slim"
      className="w-fit"
      iconsOnEdge={false}
      rightIcon={<MdLaunch aria-hidden={true} className="w-5 h-5 max-w-5 max-h-5 min-w-5 min-h-5" />}
      clickableProps={{ className: 'text-xs' }}
    />

    <Separator />
  </li>
)

export const BuyAndSellTokensAboutDataModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'buyAndSellTokensAboutData' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdInfoOutline aria-hidden={true} />}
      contentClassName="flex flex-col gap-y-5 overflow-y-auto text-xs text-white py-6"
      onClose={modalNavigateWrapper(-1)}
    >
      <ul className="flex flex-col w-full gap-y-5">
        <LinkItem
          title={t('sumbsub.title')}
          to={SUMSUB_TERMS_AND_CONDITIONS_LINK}
          linkLabel={t('sumbsub.link')}
          svgImage={<SumsubLogo aria-hidden={true} className="h-full" />}
        />

        <LinkItem
          title={t('unlimit.title')}
          to={UNLIMIT_USE_TERMS_LINK}
          linkLabel={t('unlimit.link')}
          svgImage={<UnlimitLogo aria-hidden={true} className="h-full" />}
        />
      </ul>

      <p>{t('description')}</p>

      <AlertErrorBanner className="bg-magenta-700/50 gap-3 p-3" message={t('alert')} messageClassName="font-normal" />
    </SideModalLayout>
  )
}
