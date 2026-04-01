import { useRef } from 'react'

import { LoggerHelper } from '@renderer/helpers/LoggerHelper'

import { useLoginSessionSelector, useUnreadNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { useMount } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import { authReducerActions } from '@renderer/store/reducers/auth'
import type { TNotification, TWallet } from '@shared/types/store'

const useBackupReminderNotificationProcess = () => {
  const dispatch = useAppDispatch()

  const { loginSessionRef } = useLoginSessionSelector()

  const hasUnreadNotification = useRef(false)
  const hasWalletWithoutBackup = useRef(false)

  const processNotification = (notification: TNotification) => {
    try {
      if (hasUnreadNotification.current) return

      const payload = notification.action?.payload

      if (payload?.to !== 'backup-wallet') return

      hasUnreadNotification.current = true
    } catch (error) {
      LoggerHelper.error(error, { where: 'useBackupReminderNotificationProcess', operation: 'processNotification' })
    }
  }

  const processWallet = (wallet: TWallet) => {
    try {
      if (
        hasUnreadNotification.current ||
        hasWalletWithoutBackup.current ||
        wallet.backupStatus === 'successful' ||
        loginSessionRef.current?.type !== 'password'
      )
        return

      hasWalletWithoutBackup.current = true
    } catch (error) {
      LoggerHelper.error(error, { where: 'useBackupReminderNotificationProcess', operation: 'processWallet' })
    }
  }

  const finish = () => {
    try {
      if (hasUnreadNotification.current || !hasWalletWithoutBackup.current) return

      const notificationPrefix = 'pages:private.walletTasksManagerSetup.useBackupReminderNotificationProcess'

      setTimeout(() => {
        dispatch(
          authReducerActions.saveNotification({
            title: `${notificationPrefix}.notificationTitle`,
            previewBody: `${notificationPrefix}.notificationDescription`,
            priority: 'high',
            action: {
              type: 'navigate',
              payload: { to: 'backup-wallet' },
            },
          })
        )

        hasWalletWithoutBackup.current = false
        hasUnreadNotification.current = false
      }, 2000)
    } catch (error) {
      LoggerHelper.error(error, { where: 'useBackupReminderNotificationProcess', operation: 'finish' })
    }
  }

  return { processNotification, processWallet, finish }
}

const WalletTasksManagerSetup = () => {
  const { wallets } = useWalletsSelector()
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()
  const backupReminderNotificationProcess = useBackupReminderNotificationProcess()

  const walletsAlreadyProcessedRef = useRef<Set<string>>(new Set())

  useMount(() => {
    requestIdleCallback(
      async () => {
        for (const notification of unreadNotificationsRef.current) {
          backupReminderNotificationProcess.processNotification(notification)
        }

        for (const wallet of wallets) {
          if (walletsAlreadyProcessedRef.current.has(wallet.id)) continue

          walletsAlreadyProcessedRef.current.add(wallet.id)

          backupReminderNotificationProcess.processWallet(wallet)
        }

        backupReminderNotificationProcess.finish()
      },
      { timeout: 20000 }
    )
  }, [wallets.length])

  return null
}

export default WalletTasksManagerSetup
