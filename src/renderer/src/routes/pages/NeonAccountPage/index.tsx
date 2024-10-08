import { Trans, useTranslation } from 'react-i18next'
import { TbFileImport, TbPackageExport, TbWallet } from 'react-icons/tb'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'
import { EWelcomeTabItemType } from '@renderer/layouts/WelcomeWithTabs/WelcomeTabs'
import { CardLink } from '@renderer/routes/pages/NeonAccountPage/CardLink'

export const NeonAccountPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'neonAccount' })

  return (
    <WelcomeWithTabsLayout tabItemType={EWelcomeTabItemType.NEON_ACCOUNT}>
      <div className="flex flex-col gap-y-6" {...TestHelper.buildTestObject('neon-account-container')}>
        <p className="text-white text-center text-sm">{t('text')}</p>

        <ul className="flex flex-col gap-y-2">
          <li>
            <CardLink
              to="/welcome-security-setup"
              title={t('cardLinks.createNewWallet.title')}
              icon={<TbWallet aria-hidden={true} />}
              text={
                <Trans t={t} i18nKey="cardLinks.createNewWallet.text">
                  start
                  <span className="uppercase">middle</span>
                  end
                </Trans>
              }
              {...TestHelper.buildTestObject('create-new-wallet')}
            />
          </li>

          <li>
            <CardLink
              to="/welcome-import-wallet/1"
              title={t('cardLinks.importExternalWallet.title')}
              icon={<TbFileImport aria-hidden={true} />}
              text={
                <Trans t={t} i18nKey="cardLinks.importExternalWallet.text">
                  start
                  <span className="uppercase">middle</span>
                  end
                </Trans>
              }
            />
          </li>

          <li>
            <CardLink
              to="/welcome-import-wallet/1"
              title={t('cardLinks.migrateFromNeon2.title')}
              icon={<TbPackageExport aria-hidden={true} />}
              text={
                <Trans t={t} i18nKey="cardLinks.migrateFromNeon2.text">
                  start
                  <span className="uppercase">middle</span>
                  end
                </Trans>
              }
            />
          </li>
        </ul>
      </div>
    </WelcomeWithTabsLayout>
  )
}
