import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TbDownload } from 'react-icons/tb'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { cloneDeep } from 'lodash'

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
  const isDownloading = useRef(false)

  const handleDownload = async () => {
    try {
      if (isDownloading.current) return

      isDownloading.current = true

      const loginSession = currentLoginSessionRef.current

      if (!loginSession) throw new Error('Login session not defined')

      const { encryptedPassword } = loginSession
      const { encryptedNewPassword } = state

      const walletPromises = wallets.map(async wallet => {
        const clonedWallet = cloneDeep(wallet)

        const accountPromises = accounts
          .filter(({ idWallet }) => idWallet === clonedWallet.id)
          .map(async account => {
            const { encryptedKey } = account

            if (!encryptedKey) return account

            const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
              value: encryptedKey,
              encryptedSecret: encryptedPassword,
            })

            const newEncryptedKey = await window.api.sendAsync('encryptBasedEncryptedSecret', {
              value: key,
              encryptedSecret: encryptedNewPassword,
            })

            return { ...account, encryptedKey: newEncryptedKey }
          })

        const newAccounts = await Promise.all(accountPromises)
        const encryptedMnemonic = clonedWallet.encryptedMnemonic

        if (encryptedMnemonic) {
          const mnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: encryptedMnemonic,
            encryptedSecret: encryptedPassword,
          })

          const newEncryptedMnemonic = await window.api.sendAsync('encryptBasedEncryptedSecret', {
            value: mnemonic,
            encryptedSecret: encryptedNewPassword,
          })

          clonedWallet.encryptedMnemonic = newEncryptedMnemonic
        }

        dispatch(authReducerActions.saveWallet({ ...clonedWallet, accounts: newAccounts }))
      })

      await Promise.all(walletPromises)

      await setHasPassword(encryptedNewPassword, true)

      navigate('/app/settings/security/change-password/step-3')
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('error') })
    } finally {
      isDownloading.current = false
    }
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
        label={t('buttonDownload')}
        type="button"
        variant="contained"
        className="w-[268px]"
        disabled={isDownloading.current}
        loading={isDownloading.current}
        leftIcon={<TbDownload />}
        onDownload={handleDownload}
      />
    </div>
  )
}
