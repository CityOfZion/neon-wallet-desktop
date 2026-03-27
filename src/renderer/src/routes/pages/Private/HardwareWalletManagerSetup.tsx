import { useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useEditAccount } from '@renderer/hooks/useAccountActions'
import { useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

const HardwareWalletManagerSetup = () => {
  const { walletsRef } = useWalletsSelector()
  const { loginSessionRef } = useLoginSessionSelector()
  const { editAccount } = useEditAccount()
  const { t: tCommon } = useTranslation('pages', { keyPrefix: 'private.hardwareWalletManagerSetup' })

  const transformHardwareAccountsToWatch = useCallback(() => {
    walletsRef.current
      .filter(wallet => wallet.type === 'hardware')
      .forEach(wallet => {
        wallet.accounts.forEach(account => {
          editAccount({
            account,
            data: {
              type: 'watch',
            },
          })
        })
      })
  }, [editAccount, walletsRef])

  useMountUnsafe(() => {
    if (loginSessionRef.current?.type === 'password') {
      transformHardwareAccountsToWatch()
    }
  })

  useEffect(() => {
    const removeOnDisconnectListener = window.api.listen(
      'hardwareWallet:onDisconnect',
      transformHardwareAccountsToWatch
    )

    return () => {
      removeOnDisconnectListener()
    }
  }, [loginSessionRef, transformHardwareAccountsToWatch])

  useEffect(() => {
    const removeOnSignatureStartListener = window.api.listen('hardwareWallet:onSignatureStart', () => {
      ToastHelper.loading({ message: tCommon('requestingPermission'), id: 'hardware-wallet-request-permission' })
    })

    const removeOnSignatureEndListener = window.api.listen('hardwareWallet:onSignatureEnd', () => {
      ToastHelper.dismiss('hardware-wallet-request-permission')
    })

    return () => {
      removeOnSignatureStartListener()
      removeOnSignatureEndListener()
    }
  }, [tCommon])

  return null
}

export default HardwareWalletManagerSetup
