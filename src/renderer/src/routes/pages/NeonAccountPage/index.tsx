import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ReactComponent as FileImportIcon } from '@renderer/assets/images/file-import-icon.svg'
import { ReactComponent as PackageExportIcon } from '@renderer/assets/images/package-export-icon.svg'
import { ReactComponent as TablerWalletIcon } from '@renderer/assets/images/tabler-wallet-icon.svg'
import { WelcomeWithTabsLayout } from '@renderer/layouts/WelcomeWithTabs'
import { WelcomeTabItemType } from '@renderer/layouts/WelcomeWithTabs/WelcomeTabs'
import { CardLink } from '@renderer/routes/pages/NeonAccountPage/CardLink'

enum Type {
  CREATE_NEW_WALLET = 'createNewWallet',
  IMPORT_EXTERNAL_WALLET = 'importExternalWallet',
  MIGRATE_FROM_NEON_2 = 'migrateFromNeon2',
}

const list = [
  {
    to: '/welcome-security-setup',
    icon: <TablerWalletIcon aria-hidden={true} />,
    type: Type.CREATE_NEW_WALLET,
  },
  {
    to: '/welcome-import-wallet/1',
    icon: <FileImportIcon aria-hidden={true} />,
    type: Type.IMPORT_EXTERNAL_WALLET,
  },
  {
    to: '/welcome-import-wallet/1',
    icon: <PackageExportIcon aria-hidden={true} />,
    type: Type.MIGRATE_FROM_NEON_2,
  },
]

export const NeonAccountPage: React.FC = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'neonAccount' })

  return (
    <WelcomeWithTabsLayout tabItemType={WelcomeTabItemType.NEON_ACCOUNT}>
      <div className={'flex flex-col gap-y-6'}>
        <p className={'text-white text-center text-sm'}>{t('text')}</p>

        <ul className={'flex flex-col gap-y-2'}>
          {list.map(({ to, icon, type }) => (
            <li key={type}>
              <CardLink
                to={to}
                title={t(`cardLinks.${type}.title`)}
                text={
                  <Trans t={t} i18nKey={`cardLinks.${type}.text`}>
                    start
                    <span className={'uppercase'}>middle</span>
                    end
                  </Trans>
                }
                icon={icon}
              />
            </li>
          ))}
        </ul>
      </div>
    </WelcomeWithTabsLayout>
  )
}
