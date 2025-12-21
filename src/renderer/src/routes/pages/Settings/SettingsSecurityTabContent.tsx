import { useTranslation } from 'react-i18next'

import { MenuLink } from '@renderer/components/MenuLink'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'

import MdOutlineKey from '@renderer/assets/images/md-outline-key.svg?react'
import MdOutlineLock from '@renderer/assets/images/md-outline-lock.svg?react'
import MdOutlineSave from '@renderer/assets/images/md-outline-save.svg?react'
import TbPackageImport from '@renderer/assets/images/tb-package-import.svg?react'
import TbReload from '@renderer/assets/images/tb-reload.svg?react'

export const SettingsSecurityTabContent = () => {
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })

  const disabled = currentLoginSession?.type !== 'password'

  return (
    <nav className="mb-5 flex h-15 w-full flex-row justify-between text-[14px]">
      <ul className="flex w-full max-w-full flex-col gap-3">
        <li>
          <MenuLink
            layoutId="settings-security"
            iconElement={<MdOutlineLock aria-hidden />}
            to="/settings/security/change-password"
            className="px-3 py-2 text-sm"
            rightElement={null}
            disabled={disabled}
            {...TestHelper.buildTestObject('settings-change-password-button')}
          >
            {t('securityOption.changePassword')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-security"
            iconElement={<MdOutlineKey aria-hidden />}
            className="px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/security/encrypt-key"
          >
            {t('securityOption.encryptKey')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-security"
            iconElement={<TbReload aria-hidden />}
            className="px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/security/recover-wallet"
            disabled={disabled}
            {...TestHelper.buildTestObject('settings-recover-wallet-button')}
          >
            {t('securityOption.recoverWallet')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-security"
            iconElement={<MdOutlineSave aria-hidden />}
            className="px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/security/backup-wallet"
            disabled={disabled}
            {...TestHelper.buildTestObject('settings-backup-wallet-button')}
          >
            {t('securityOption.backupWallet')}
          </MenuLink>
        </li>

        <li>
          <MenuLink
            layoutId="settings-security"
            iconElement={<TbPackageImport aria-hidden />}
            className="text-neon aria-[current=page]:text-neon px-3 py-2 text-sm"
            rightElement={null}
            to="/settings/security/migrate-accounts"
            disabled={disabled}
            {...TestHelper.buildTestObject('settings-migrate-wallet-button')}
          >
            {t('securityOption.migrateWallets')}
          </MenuLink>
        </li>
      </ul>
    </nav>
  )
}
