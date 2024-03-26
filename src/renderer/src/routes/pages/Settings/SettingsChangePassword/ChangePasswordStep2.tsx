import { useTranslation } from 'react-i18next'
import { TbDownload } from 'react-icons/tb'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { walletReducerActions } from '@renderer/store/reducers/WalletReducer'

type TLocationState = {
  encryptedNewPassword: string
}

export const ChangePasswordStep2 = (): JSX.Element => {
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step2' })
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()

  const onDownload = async () => {
    const walletPromises = wallets.map(async wallet => {
      if (!wallet.encryptedMnemonic) return wallet
      const mnemonic = await window.api.decryptBasedEncryptedSecret(wallet.encryptedMnemonic, encryptedPassword)
      const newEncryptedMnemonic = await window.api.encryptBasedEncryptedSecret(mnemonic, state.encryptedNewPassword)
      return { ...wallet, encryptedMnemonic: newEncryptedMnemonic }
    })

    const accountPromises = accounts.map(async account => {
      if (!account.encryptedKey) return account
      const key = await window.api.decryptBasedEncryptedSecret(account.encryptedKey, encryptedPassword)
      const newEncryptedKey = await window.api.encryptBasedEncryptedSecret(key, state.encryptedNewPassword)
      return { ...account, encryptedKey: newEncryptedKey }
    })

    const newAccounts = await Promise.all([...accountPromises])
    const newWallets = await Promise.all([...walletPromises])

    dispatch(accountReducerActions.replaceAllAccounts(newAccounts))
    dispatch(walletReducerActions.replaceAllWallets(newWallets))
    dispatch(settingsReducerActions.setEncryptedPassword(state.encryptedNewPassword))

    navigate('/settings/security/change-password/step-3')
  }

  return (
    <div className="w-full px-5 flex flex-col h-full items-center justify-between pb-10">
      <div className="flex flex-col items-center pt-20 gap-5">
        <div className="w-36 h-36 rounded-full bg-asphalt flex items-center justify-center">
          <TbDownload className="text-blue w-[7rem] h-[7rem]" />
        </div>
        <span className="text-lg">{t('subtitle')}</span>
        <span className="text-xs text-gray-100 w-[30rem] text-center">{t('description')}</span>
      </div>
      <ButtonDownloadPasswordQRCode
        variant="contained"
        type="submit"
        leftIcon={<TbDownload />}
        onDownload={onDownload}
        label={t('buttonDownload')}
      />
    </div>
  )
}
