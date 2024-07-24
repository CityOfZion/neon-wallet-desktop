import { useTranslation } from 'react-i18next'
import { MdOutlineSave } from 'react-icons/md'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TAccountBackupFormat, TBackupFormat } from '@shared/@types/blockchain'

type TFormData = {
  password: string
}

type TLocationState = {
  selectedFilePath: string
}

const SuccessFooter = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordBackup' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex flex-col items-center flex-grow w-full justify-end gap-7">
      <ButtonDownloadPasswordQRCode />
      <Separator />
      <Button label={t('returnSettings')} onClick={modalNavigateWrapper(-1)} className="w-full px-9" />
    </div>
  )
}

export const ConfirmPasswordBackupModal = () => {
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'confirmPasswordBackup' })
  const { contacts } = useContactsSelector()
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const { selectedFilePath } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setError } = useActions<TFormData>({
    password: '',
  })

  const handleSubmit = async ({ password }: TFormData) => {
    const decryptedPassword = await window.api.sendAsync('decryptBasedOS', encryptedPassword ?? '')
    if (password.length === 0 || password !== decryptedPassword) {
      setError('password', t('error'))
      return
    }

    try {
      const backupFile: TBackupFormat = { wallets: [], contacts: [] }
      backupFile.contacts = contacts
      backupFile.wallets = wallets.map(({ encryptedMnemonic, ...wallet }) => {
        let mnemonic: string | undefined
        if (encryptedMnemonic) {
          mnemonic = window.api.sendSync('decryptBasedEncryptedSecretSync', {
            value: encryptedMnemonic,
            encryptedSecret: encryptedPassword,
          })
        }

        const walletAccounts: TAccountBackupFormat[] = []
        accounts.forEach(({ encryptedKey, ...account }) => {
          if (account.idWallet !== wallet.id) return

          let key: string | undefined
          if (encryptedKey) {
            key = window.api.sendSync('decryptBasedEncryptedSecretSync', {
              value: encryptedKey,
              encryptedSecret: encryptedPassword,
            })
          }

          walletAccounts.push({
            ...account,
            key,
          })
        })

        return {
          ...wallet,
          mnemonic,
          accounts: walletAccounts,
        }
      })

      const content = await window.api.sendAsync('encryptBasedSecret', {
        value: JSON.stringify(backupFile),
        secret: decryptedPassword,
      })

      await window.api.sendAsync('saveFile', {
        path: `${selectedFilePath}/NEON3-Backup-${DateHelper.getNowUnix()}.${BACKUP_FILE_EXTENSION}`,
        content,
      })

      modalNavigate('success', {
        state: {
          heading: t('title'),
          headingIcon: <MdOutlineSave className="text-neon" />,
          subtitle: t('modalDescription'),
          footer: <SuccessFooter />,
        },
        replace: true,
      })
    } catch {
      ToastHelper.error({ message: t('errorBackup') })
    }
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<MdOutlineSave className="text-neon" />}
      contentClassName="flex flex-col"
    >
      <p className="text-xs mb-5">{t('description')}</p>
      <p className="text-gray-300 uppercase font-bold mb-3.5">{t('subtitle')}</p>

      <form className="flex flex-col justify-between flex-grow" onSubmit={handleAct(handleSubmit)}>
        <div>
          <Input
            placeholder={t('inputPlaceholder')}
            error={!!actionState.errors.password}
            value={actionData.password}
            onChange={setDataFromEventWrapper('password')}
            compacted
            type="password"
          />

          <div className="mt-5">
            {actionState.errors.password && <AlertErrorBanner message={actionState.errors.password} />}
          </div>
        </div>

        <div className="flex flex-col w-full items-center">
          <Banner
            type="warningOrange"
            message={
              <span>
                {t('warning')}
                <span className="text-orange pl-0.75">{t('warningHighlighted')}</span>
              </span>
            }
          />
          <Separator className="my-7" />
          <Button
            className="px-9 w-full"
            type="submit"
            label={t('buttonContinueLabel')}
            loading={actionState.isActing}
            flat
          />
        </div>
      </form>
    </SideModalLayout>
  )
}
