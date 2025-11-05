import { useRef } from 'react'

import { useUnreadNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { useMount } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import { authReducerActions } from '@renderer/store/reducers/auth'
import * as Sentry from '@sentry/electron/renderer'
import type { IWalletState, TNotification } from '@shared/types/store'

const useBackupReminderNotificationProcess = () => {
  const dispatch = useAppDispatch()

  const hasUnreadNotification = useRef(false)
  const hasWalletWithoutBackup = useRef(false)

  const processNotification = (notification: TNotification) => {
    try {
      if (hasUnreadNotification.current) return

      const payload = notification.action?.payload

      if (payload?.to !== 'backup-wallet') return

      hasUnreadNotification.current = true
    } catch (error) {
      console.error('Error on processNotification (useBackupReminderNotificationProcess):', error)

      Sentry.captureException(error)
    }
  }

  const processWallet = (wallet: IWalletState) => {
    try {
      if (hasUnreadNotification.current || hasWalletWithoutBackup.current || wallet.backupStatus === 'successful')
        return

      hasWalletWithoutBackup.current = true
    } catch (error) {
      console.error('Error on processWallet (useBackupReminderNotificationProcess):', error)

      Sentry.captureException(error)
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
      console.error('Error on finish (BackupReminderNotificationProcess):', error)

      Sentry.captureException(error)
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
