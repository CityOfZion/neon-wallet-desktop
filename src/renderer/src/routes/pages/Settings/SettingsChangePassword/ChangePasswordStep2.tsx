import { useTranslation } from 'react-i18next'
import { TbDownload } from 'react-icons/tb'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'

type TLocationState = {
  encryptedNewPassword: string
}

export const ChangePasswordStep2 = (): JSX.Element => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step2' })
  const { wallets } = useWalletsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()
  const { setHasPassword } = useSettingsActions()

  const handleDownload = async () => {
    if (!currentLoginSessionRef.current) {
      throw new Error('Login session not defined')
    }

    const encryptedPassword = currentLoginSessionRef.current.encryptedPassword

    const walletPromises = wallets.map(async wallet => {
      const accountPromises = accounts.map(async account => {
        if (!account.encryptedKey) return account

        const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: account.encryptedKey,
          encryptedSecret: encryptedPassword,
        })

        const newEncryptedKey = await window.api.sendAsync('encryptBasedEncryptedSecret', {
          value: key,
          encryptedSecret: state.encryptedNewPassword,
        })

        return { ...account, encryptedKey: newEncryptedKey }
      })

      const newAccounts = await Promise.all([...accountPromises])

      if (wallet.encryptedMnemonic) {
        const mnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPassword,
        })

        const newEncryptedMnemonic = await window.api.sendAsync('encryptBasedEncryptedSecret', {
          value: mnemonic,
          encryptedSecret: state.encryptedNewPassword,
        })

        wallet.encryptedMnemonic = newEncryptedMnemonic
      }

      dispatch(authReducerActions.saveWallet({ ...wallet, accounts: newAccounts }))
    })

    await Promise.all(walletPromises)

    await setHasPassword(state.encryptedNewPassword, true)

    navigate('/app/settings/security/change-password/step-3')
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
        onDownload={handleDownload}
        label={t('buttonDownload')}
      />
    </div>
  )
}
