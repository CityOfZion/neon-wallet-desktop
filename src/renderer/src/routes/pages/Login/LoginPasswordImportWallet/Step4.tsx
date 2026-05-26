import { Fragment, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router'

import { Progress } from '@renderer/components/Progress'

import { AnalyticsHelper } from '@renderer/helpers/AnalyticsHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useImportAccounts } from '@renderer/hooks/useAccountActions'
import { useCreateContacts } from '@renderer/hooks/useContactActions'
import { useSignup } from '@renderer/hooks/useLogin'
import { useNavigateReset } from '@renderer/hooks/useNavigateReset'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

import NeonWalletLogo from '@renderer/assets/images/neon-wallet-compact.svg?react'

import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TCreateWalletAndAccountParam } from '@shared/types/blockchain'
import { TContact, TSwapRecord } from '@shared/types/store'

type TLocationState = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  contacts?: TContact[]
  password: string
}

export const LoginPasswordImportWalletStep4Content = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.importStep' })
  const { state } = useLocation() as Location<TLocationState>
  const navigateReset = useNavigateReset()
  const navigate = useNavigate()
  const { createContacts } = useCreateContacts()
  const { createWallet } = useCreateWallet()
  const { importAccounts } = useImportAccounts()
  const { signup } = useSignup()
  const dispatch = useAppDispatch()

  const isImporting = useRef(false)

  const [progress, setProgress] = useState(0)

  const handleImport = async () => {
    try {
      const { wallets, contacts, password, swapRecords } = state
      const progressByStep = 100 / (wallets.length + 3)

      await signup(password)

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

      AnalyticsHelper.logEvent('onboarding_completed')

      navigateReset('/login-import-wallet-setup/5')
    } catch (error) {
      ToastHelper.error({ message: AppError.wrap(error).displayMessage })
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
      <p className="mt-15 text-center text-sm text-white">{t('title')}</p>

      <Progress value={progress} className="mt-7" />

      <NeonWalletLogo aria-hidden className="absolute -bottom-11 -left-11 h-50 w-55 fill-gray-700/30" />
    </Fragment>
  )
}
