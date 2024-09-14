import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { ReactComponent as NeonWalletLogo } from '@renderer/assets/images/neon-wallet-compact.svg'
import { Progress } from '@renderer/components/Progress'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordActions } from '@renderer/hooks/useSettingsSelector'
import { contactReducerActions } from '@renderer/store/reducers/ContactReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TAccountsToImport, TWalletToCreate } from '@shared/@types/blockchain'
import { IContactState } from '@shared/@types/store'

type TLocationState = {
  wallets: (TWalletToCreate & {
    accounts: TAccountsToImport
  })[]
  contacts?: IContactState[]
  password: string
}

export const WelcomeImportWalletStep4Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step4' })
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { createWallet, importAccounts } = useBlockchainActions()
  const { setEncryptedPassword } = useEncryptedPasswordActions()

  const isImporting = useRef(false)

  const [progress, setProgress] = useState(0)

  const handleImport = async () => {
    try {
      const progressByStep = 100 / state.wallets.length + 3

      await setEncryptedPassword(state.password)

      setProgress(progress => progress + progressByStep)

      if (state.contacts) {
        state.contacts.forEach(contact => {
          dispatch(contactReducerActions.saveContact(contact))
        })
      }

      await UtilsHelper.sleep(1000)
      setProgress(progress => progress + progressByStep)

      for (const walletToCreate of state.wallets) {
        const wallet = await createWallet({
          name: walletToCreate.name,
          mnemonic: walletToCreate.mnemonic,
        })
        await importAccounts({
          accounts: walletToCreate.accounts,
          wallet,
        })

        await UtilsHelper.sleep(1000)
        setProgress(progress => progress + progressByStep)
      }

      await UtilsHelper.sleep(1000)
      setProgress(progress => progress + progressByStep)

      await UtilsHelper.sleep(1000)

      dispatch(settingsReducerActions.setHasLogin(true))
      navigate('/welcome-import-wallet/5')
    } catch (error: any) {
      ToastHelper.error({ message: error.message })
      navigate(-1)
    }
  }

  useEffect(() => {
    if (isImporting.current) return
    isImporting.current = true

    handleImport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Fragment>
      <p className="text-sm text-white mt-15">{t('title')}</p>

      <Progress value={progress} className="mt-7" />

      <NeonWalletLogo className="w-[13.75rem] h-[12.5rem] fill-gray-700/30 absolute -bottom-11 -left-11" />
    </Fragment>
  )
}
