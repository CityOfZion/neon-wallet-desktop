import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { ReactComponent as NeonWalletLogo } from '@renderer/assets/images/neon-wallet-compact.svg'
import { Progress } from '@renderer/components/Progress'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useSettingsActions } from '@renderer/hooks/useSettingsSelector'
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
  const { createWallet, importAccounts, createContacts } = useBlockchainActions()
  const { setHasPassword } = useSettingsActions()

  const isImporting = useRef(false)

  const [progress, setProgress] = useState(0)

  const handleImport = async () => {
    try {
      const { wallets, contacts, password } = state
      const progressByStep = 100 / wallets.length + 3

      await setHasPassword(password)

      setProgress(progress => progress + progressByStep)

      if (contacts) createContacts(contacts)

      await UtilsHelper.sleep(1000)

      setProgress(progress => progress + progressByStep)

      for (const { name, mnemonic, accounts } of wallets) {
        const wallet = await createWallet({ name, mnemonic })

        await importAccounts({ accounts, wallet })

        await UtilsHelper.sleep(1000)

        setProgress(progress => progress + progressByStep)
      }

      await UtilsHelper.sleep(1000)

      setProgress(progress => progress + progressByStep)

      await UtilsHelper.sleep(1000)

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
