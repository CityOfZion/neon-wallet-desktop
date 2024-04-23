import { useTranslation } from 'react-i18next'
import { TbArrowRight } from 'react-icons/tb'
import { ReactComponent as GetAppImage } from '@renderer/assets/images/get-app-image.svg'
import { ReactComponent as LedgerLogo } from '@renderer/assets/images/ledger-logo.svg'
import { ReactComponent as NeonPageImage } from '@renderer/assets/images/neon-page-image.svg'
import { ReactComponent as WalletConnectLogo } from '@renderer/assets/images/wallet-connect-logo.svg'
import { Link } from '@renderer/components/Link'
import { WelcomeLayout } from '@renderer/layouts/Welcome'

import { WelcomeCard } from './WelcomeCard'

export const WelcomePage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome' })

  return (
    <WelcomeLayout heading={t('title')} bigger className="relative">
      <Link to="/welcome-import-wallet/1" className="absolute right-16" label="Import wallet" variant="text" />

      <ul className="flex gap-x-12 mt-14 flex-grow ">
        <li>
          <WelcomeCard image={<NeonPageImage />} title={t('card1.title')} description={t('card1.description')} />
        </li>

        <li>
          <WelcomeCard image={<WalletConnectLogo />} title={t('card2.title')} description={t('card2.description')} />
        </li>

        <li>
          <WelcomeCard image={<GetAppImage />} title={t('card3.title')} description={t('card3.description')} />
        </li>

        <li>
          <WelcomeCard image={<LedgerLogo />} title={t('card4.title')} description={t('card4.description')} />
        </li>
      </ul>

      <div className="flex gap-x-5 ">
        <Link
          to="/welcome-security-setup"
          label={t('setupSecurityButtonLabel')}
          rightIcon={<TbArrowRight />}
          variant="contained"
          clickableProps={{ className: 'py-3 px-8' }}
          iconsOnEdge={false}
        />
      </div>
    </WelcomeLayout>
  )
}
