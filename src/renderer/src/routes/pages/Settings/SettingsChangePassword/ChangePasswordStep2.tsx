import { useRef } from 'react'

import { cloneDeep } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useSignup } from '@renderer/hooks/useLogin'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import TbDownload from '@renderer/assets/images/tb-download.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'

type TLocationState = {
  encryptedNewPassword: string
}

const ChangePasswordStep2 = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step2' })
  const { wallets } = useWalletsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()
  const { signup } = useSignup()
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

          clonedWallet.encryptedMnemonic = await window.api.sendAsync('encryptBasedEncryptedSecret', {
            value: mnemonic,
            encryptedSecret: encryptedNewPassword,
          })
        }

        dispatch(authReducerActions.saveWallet({ ...clonedWallet, accounts: newAccounts }))
      })

      await Promise.all(walletPromises)

      await signup(encryptedNewPassword, true)

      navigate('/settings/security/change-password/3')
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('error') })
    } finally {
      isDownloading.current = false
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-5 pb-10">
      <div className="flex flex-col items-center gap-5 pt-20">
        <div className="bg-asphalt flex h-36 w-36 items-center justify-center rounded-full">
          <TbDownload aria-hidden className="text-blue h-28 w-28" />
        </div>
        <span className="text-lg">{t('subtitle')}</span>
        <span className="w-120 text-center text-xs text-gray-100">{t('description')}</span>
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

export default ChangePasswordStep2
