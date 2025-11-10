import { Fragment, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Progress } from '@renderer/components/Progress'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'

import NeonWalletLogo from '@renderer/assets/images/neon-wallet-compact.svg?react'

import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TCreateWalletAndAccountParam } from '@shared/types/blockchain'
import { IContactState, TSwapRecord } from '@shared/types/store'

type TLocationState = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  contacts?: IContactState[]
  password: string
}

const LoginPasswordImportWalletStep4Page = () => {
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
      const { wallets, contacts, password, swapRecords } = state
      const progressByStep = 100 / (wallets.length + 3)

      await setHasPassword(password)

      setProgress(progress => progress + progressByStep)

      if (swapRecords) swapRecords.forEach(swapRecord => dispatch(utilityReducerActions.persistSwapRecord(swapRecord)))
      if (contacts) createContacts(contacts)

      await SharedUtilsHelper.sleep(250)

      setProgress(progress => progress + progressByStep)

      for (const { accounts, ...currentWallet } of wallets) {
        const wallet = createWallet(currentWallet)

        await importAccounts({ accounts, wallet })

        await SharedUtilsHelper.sleep(250)

        setProgress(progress => progress + progressByStep)
      }

      await SharedUtilsHelper.sleep(250)

      setProgress(progress => progress + progressByStep)

      await SharedUtilsHelper.sleep(250)

      navigate('/login-import-wallet-setup/5')
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
      <p className="mt-15 text-sm text-white">{t('title')}</p>

      <Progress value={progress} className="mt-7" />

      <NeonWalletLogo aria-hidden className="absolute -bottom-11 -left-11 h-50 w-55 fill-gray-700/30" />
    </Fragment>
  )
}

export default LoginPasswordImportWalletStep4Page
