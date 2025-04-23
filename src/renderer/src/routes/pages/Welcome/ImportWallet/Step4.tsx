import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-compact.svg?react'
import { Progress } from '@renderer/components/Progress'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TCreateWalletAndAccountParam } from '@shared/@types/blockchain'
import { IContactState, TMigrationsNeo3, TSwapRecord } from '@shared/@types/store'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

type TLocationState = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  migrationsNeo3?: TMigrationsNeo3
  contacts?: IContactState[]
  password: string
}

export const WelcomeImportWalletStep4Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.step4' })
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()
  const { createWallet, importAccounts, createContacts } = useBlockchainActions()
  const { setHasPassword } = useSettingsActions()
  const dispatch = useAppDispatch()

  const isImporting = useRef(false)

  const [progress, setProgress] = useState(0)

  const handleImport = async () => {
    try {
      const { wallets, contacts, password, swapRecords, migrationsNeo3 } = state
      const progressByStep = 100 / (wallets.length + 3)

      await setHasPassword(password)

      setProgress(progress => progress + progressByStep)

      if (swapRecords) swapRecords.forEach(swapRecord => dispatch(utilityReducerActions.persistSwapRecord(swapRecord)))
      if (migrationsNeo3) dispatch(utilityReducerActions.mergeMigrationsNeo3(migrationsNeo3))
      if (contacts) createContacts(contacts)

      await SharedUtilsHelper.sleep(250)

      setProgress(progress => progress + progressByStep)

      for (const { name, mnemonic, type, id, accounts } of wallets) {
        const wallet = createWallet({ name, mnemonic, type, id })

        await importAccounts({ accounts, wallet })

        await SharedUtilsHelper.sleep(250)

        setProgress(progress => progress + progressByStep)
      }

      await SharedUtilsHelper.sleep(250)

      setProgress(progress => progress + progressByStep)

      await SharedUtilsHelper.sleep(250)

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
