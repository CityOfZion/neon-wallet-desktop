import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { IAccountState, IWalletState, TLoginSession, TNotification, TSaveNotification } from '@shared/@types/store'
import { cloneDeep } from 'lodash'

import { IAuthReducer } from '.'

const setCurrentLoginSession: CaseReducer<IAuthReducer, PayloadAction<TLoginSession | undefined>> = (state, action) => {
  state.inMemoryData.currentLoginSession = action.payload
}

const resetTemporaryApplicationData: CaseReducer<IAuthReducer> = state => {
  state.data.applicationDataByLoginType.hardware = { wallets: [], notifications: [] }
  state.data.applicationDataByLoginType.key = { wallets: [], notifications: [] }
}

// Wallet Reducers
const saveWallet: CaseReducer<IAuthReducer, PayloadAction<IWalletState>> = (state, action) => {
  if (!state.inMemoryData.currentLoginSession) {
    throw new Error('Error to save wallet: Current login session is not defined')
  }

  const loginSessionType = state.inMemoryData.currentLoginSession.type
  const wallet = action.payload

  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  const walletIndex = applicationData.wallets.findIndex(it => it.id === wallet.id)
  if (walletIndex < 0) {
    applicationData.wallets = [...applicationData.wallets, wallet]
    return
  }

  applicationData.wallets[walletIndex] = wallet
}

const deleteWallet: CaseReducer<IAuthReducer, PayloadAction<string>> = (state, action) => {
  if (!state.inMemoryData.currentLoginSession) {
    throw new Error('Error to delete wallet: Current login session is not defined')
  }

  const loginSessionType = state.inMemoryData.currentLoginSession.type
  const walletId = action.payload
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  applicationData.wallets = applicationData.wallets.filter(it => it.id !== walletId)
}

// Account Reducers
const saveAccount: CaseReducer<IAuthReducer, PayloadAction<IAccountState>> = (state, action) => {
  if (!state.inMemoryData.currentLoginSession) {
    throw new Error('Error to save account: Current login session is not defined')
  }

  const loginSessionType = state.inMemoryData.currentLoginSession.type
  const account = action.payload
  const walletId = account.idWallet

  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  const wallet = applicationData.wallets.find(it => it.id === walletId)
  if (!wallet) {
    throw new Error('Error to save account: Wallet not found')
  }

  const accountIndex = wallet.accounts.findIndex(it => it.id === account.id)
  if (accountIndex < 0) {
    wallet.accounts = [...wallet.accounts, account]
    return
  }

  wallet.accounts[accountIndex] = account
}

const deleteAccount: CaseReducer<IAuthReducer, PayloadAction<IAccountState>> = (state, action) => {
  if (!state.inMemoryData.currentLoginSession) {
    throw new Error('Error to delete account: Current login session is not defined')
  }

  const loginSessionType = state.inMemoryData.currentLoginSession.type
  const accountToRemove = action.payload
  const walletId = accountToRemove.idWallet

  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  const wallet = applicationData.wallets.find(it => it.id === walletId)
  if (!wallet) {
    throw new Error('Error to delete account: Wallet not found')
  }

  wallet.accounts = wallet.accounts.filter(account => account.id !== accountToRemove.id)
}

const removeAccountSkins: CaseReducer<IAuthReducer, PayloadAction<string[]>> = (state, action) => {
  if (!state.inMemoryData.currentLoginSession) {
    throw new Error('Error to delete account: Current login session is not defined')
  }

  const invalidSkinIds = action.payload
  const applicationDataByLoginTypeCloned = cloneDeep(state.data.applicationDataByLoginType)

  applicationDataByLoginTypeCloned[state.inMemoryData.currentLoginSession.type]?.wallets?.forEach((wallet: any) =>
    wallet.accounts.forEach((account: any) => {
      if (invalidSkinIds.includes(account.skin.id)) account.skin = UtilsHelper.generateColorSkin()
    })
  )

  state.data.applicationDataByLoginType = applicationDataByLoginTypeCloned
}

// Notification Reducers
const saveNotification: CaseReducer<IAuthReducer, PayloadAction<TSaveNotification>> = (state, action) => {
  const loginSessionType = state.inMemoryData.currentLoginSession?.type ?? 'password'

  const notification: TNotification = {
    id: UtilsHelper.uuid(),
    date: DateHelper.getNowUnix(),
    read: false,
    priority: 'low',
    provider: 'system',
    ...action.payload,
  }
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  const findIndex = applicationData.notifications.findIndex(item => item.id === notification.id)

  if (findIndex < 0) {
    applicationData.notifications = [...applicationData.notifications, notification]

    new window.Notification(notification.title, {
      body: notification.previewBody,
    })

    return
  }

  applicationData.notifications[findIndex] = notification
}

export const authSliceReducers = {
  setCurrentLoginSession,

  resetTemporaryApplicationData,

  saveWallet,
  deleteWallet,

  saveAccount,
  deleteAccount,
  removeAccountSkins,

  saveNotification,
}
