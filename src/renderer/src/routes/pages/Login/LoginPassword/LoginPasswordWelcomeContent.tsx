import { Trans, useTranslation } from 'react-i18next'

import { TestHelper } from '@renderer/helpers/TestHelper'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'
import TbPackageExport from '@renderer/assets/images/tb-package-export.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'

import { LoginPasswordCardLink } from './LoginPasswordCardLink'

export const LoginPasswordWelcomeContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'loginPassword.welcomeContent' })

  return (
    <div className="flex flex-col gap-y-6" {...TestHelper.buildTestObject('login-password-welcome-container')}>
      <p className="text-center text-sm text-white">{t('text')}</p>

      <ul className="flex flex-col gap-y-2">
        <li>
          <LoginPasswordCardLink
            {...TestHelper.buildTestObject('create-new-wallet')}
            to="/login-security-setup/1"
            title={t('cardLinks.createNewWallet.title')}
            icon={<TbWallet aria-hidden />}
            text={
              <Trans t={t} i18nKey="cardLinks.createNewWallet.text">
                start
                <span className="uppercase">middle</span>
                end
              </Trans>
            }
          />
        </li>

        <li>
          <LoginPasswordCardLink
            {...TestHelper.buildTestObject('import-wallet')}
            to="/login-import-wallet-setup/1"
            title={t('cardLinks.importExternalWallet.title')}
            icon={<TbFileImport aria-hidden />}
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
          <LoginPasswordCardLink
            to="/login-import-wallet-setup/1"
            state={{ isMigration: true }}
            title={t('cardLinks.migrateFromNeon2.title')}
            icon={<TbPackageExport aria-hidden />}
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
  )
}
