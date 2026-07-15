import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import {
  TAccount,
  TLoginSession,
  TNotification,
  TSaveConversation,
  TSaveNotification,
  TWallet,
} from '@shared/types/store'

import { TAuthReducer } from '.'

const { t } = SharedI18nextHelper.get()

const setLoginSession: CaseReducer<TAuthReducer, PayloadAction<TLoginSession | undefined>> = (state, action) => {
  state.memoryData.loginSession = action.payload
}

const resetTemporaryApplicationData: CaseReducer<TAuthReducer> = state => {
  state.data.applicationDataByLoginType.hardware = {
    wallets: [],
    notifications: [],
    shouldConfirmAction: false,
    conversations: [],
  }

  state.data.applicationDataByLoginType.key = {
    wallets: [],
    notifications: [],
    shouldConfirmAction: true,
    conversations: [],
  }
}

const setShouldConfirmAction: CaseReducer<TAuthReducer, PayloadAction<boolean>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type
  if (!loginSessionType) return

  state.data.applicationDataByLoginType[loginSessionType].shouldConfirmAction = action.payload
}

// Wallet Reducers
const saveWallet: CaseReducer<TAuthReducer, PayloadAction<TWallet>> = (state, action) => {
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

const deleteWallet: CaseReducer<TAuthReducer, PayloadAction<string>> = (state, action) => {
  const loginSessionType = state.memoryData.loginSession?.type

  if (!loginSessionType) {
    throw new AppError(t('errors.loginSessionIsNotDefined'))
  }

  const walletId = action.payload
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  applicationData.wallets = applicationData.wallets.filter(({ id }) => id !== walletId)
}

// Account Reducers
const saveAccount: CaseReducer<TAuthReducer, PayloadAction<TAccount>> = (state, action) => {
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

const deleteAccount: CaseReducer<TAuthReducer, PayloadAction<TAccount>> = (state, action) => {
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
const saveNotification: CaseReducer<TAuthReducer, PayloadAction<TSaveNotification>> = (state, action) => {
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

// Conversation reducers
const saveConversation: CaseReducer<TAuthReducer, PayloadAction<TSaveConversation>> = (state, action) => {
  const loginType = state.memoryData.loginSession?.type

  if (!loginType) return

  const conversationToSave = cloneDeep(action.payload)
  const { id } = conversationToSave
  const { conversations } = state.data.applicationDataByLoginType[loginType]
  const index = conversations.findIndex(conversation => conversation.id === id)
  const isNew = index === -1

  const conversation = isNew
    ? { id, name: '', date: new Date().toJSON(), messages: [] }
    : cloneDeep(conversations[index])

  if (conversationToSave.name) {
    conversation.name = conversationToSave.name
  }

  const hasNewMessages = conversationToSave.messages && conversationToSave.messages.length > 0

  if (hasNewMessages) {
    conversation.messages.push(...conversationToSave.messages!)
  }

  if (isNew) {
    conversations.unshift(conversation)

    return
  }

  if (hasNewMessages) {
    conversations.splice(index, 1)
    conversations.unshift(conversation)

    return
  }

  conversations[index] = conversation
}

type TSaveConversationDraftTextParams = {
  id: string
  text: string
}

const saveConversationDraftText: CaseReducer<TAuthReducer, PayloadAction<TSaveConversationDraftTextParams>> = (
  state,
  action
) => {
  const { id, text } = action.payload

  state.memoryData.conversationDraftTexts[id] = text
}

const clearConversationDraftText: CaseReducer<TAuthReducer, PayloadAction<string>> = (state, action) => {
  delete state.memoryData.conversationDraftTexts[action.payload]
}

const clearAllConversationDraftTexts: CaseReducer<TAuthReducer> = state => {
  state.memoryData.conversationDraftTexts = {}
}

const setLastConversationId: CaseReducer<TAuthReducer, PayloadAction<string | null>> = (state, action) => {
  state.memoryData.lastConversationId = action.payload
}

export const authSliceReducers = {
  setLoginSession,

  resetTemporaryApplicationData,

  saveWallet,
  deleteWallet,

  saveAccount,
  deleteAccount,

  saveNotification,

  setShouldConfirmAction,

  saveConversation,
  saveConversationDraftText,
  clearConversationDraftText,
  clearAllConversationDraftTexts,
  setLastConversationId,
}
