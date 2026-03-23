import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import { IAccountState, IWalletState, TLoginSession, TNotification, TSaveNotification } from '@shared/types/store'

import { IAuthReducer } from '.'

const { t } = SharedI18nextHelper.get()

const setLoginSession: CaseReducer<IAuthReducer, PayloadAction<TLoginSession | undefined>> = (state, action) => {
  state.memoryData.loginSession = action.payload
}

const resetTemporaryApplicationData: CaseReducer<IAuthReducer> = state => {
  state.data.applicationDataByLoginType.hardware = { wallets: [], notifications: [] }
  state.data.applicationDataByLoginType.key = { wallets: [], notifications: [] }
}

// Wallet Reducers
const saveWallet: CaseReducer<IAuthReducer, PayloadAction<IWalletState>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) {
    throw new AppError(t('errors.loginSessionIsNotDefined'))
  }

  const wallet = action.payload
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]
  const walletIndex = applicationData.wallets.findIndex(({ id }) => id === wallet.id)

  if (walletIndex < 0) {
    applicationData.wallets = [...applicationData.wallets, wallet]

    return
  }

  applicationData.wallets[walletIndex] = wallet
}

const deleteWallet: CaseReducer<IAuthReducer, PayloadAction<string>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) {
    throw new AppError(t('errors.loginSessionIsNotDefined'))
  }

  const walletId = action.payload
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  applicationData.wallets = applicationData.wallets.filter(({ id }) => id !== walletId)
}

// Account Reducers
const saveAccount: CaseReducer<IAuthReducer, PayloadAction<IAccountState>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) {
    throw new AppError(t('errors.loginSessionIsNotDefined'))
  }

  const account = action.payload
  const walletId = account.idWallet
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]
  const wallet = applicationData.wallets.find(({ id }) => id === walletId)

  if (!wallet) {
    throw new AppError(t('errors.unexpectedError'))
  }

  const accountIndex = wallet.accounts.findIndex(({ id }) => id === account.id)

  if (accountIndex < 0) {
    wallet.accounts = [...wallet.accounts, account]

    return
  }

  wallet.accounts[accountIndex] = account
}

const deleteAccount: CaseReducer<IAuthReducer, PayloadAction<IAccountState>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) {
    throw new AppError(t('errors.loginSessionIsNotDefined'))
  }

  const accountToRemove = action.payload
  const walletId = accountToRemove.idWallet
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]
  const wallet = applicationData.wallets.find(({ id }) => id === walletId)

  if (!wallet) {
    throw new AppError(t('errors.unexpectedError'))
  }

  wallet.accounts = wallet.accounts.filter(account => account.id !== accountToRemove.id)
}

// Notification Reducers
const saveNotification: CaseReducer<IAuthReducer, PayloadAction<TSaveNotification>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) return

  const notification: TNotification = {
    id: UtilsHelper.uuid(),
    date: new Date().toJSON(),
    read: false,
    priority: 'low',
    provider: 'system',
    ...action.payload,
  }

  const applicationData = state.data.applicationDataByLoginType[loginSessionType]
  const foundIndex = applicationData.notifications.findIndex(({ id }) => id === notification.id)

  if (foundIndex < 0) {
    applicationData.notifications = [...applicationData.notifications, notification]

    new window.Notification(
      t(notification.title, { defaultValue: notification.title, value: notification.titleValue }),
      {
        body: t(notification.previewBody, {
          defaultValue: notification.previewBody,
          value: notification.previewBodyValue,
        }),
      }
    )

    return
  }

  applicationData.notifications[foundIndex] = notification
}

export const authSliceReducers = {
  setLoginSession,

  resetTemporaryApplicationData,

  saveWallet,
  deleteWallet,

  saveAccount,
  deleteAccount,

  saveNotification,
}
