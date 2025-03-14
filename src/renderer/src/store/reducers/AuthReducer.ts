import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import {
  IAccountState,
  IWalletState,
  TLastIndexesByWallet,
  TLoginSession,
  TLoginSessionType,
  TNotification,
  TSaveNotification,
  TSwapRecord,
} from '@shared/@types/store'
import { cloneDeep } from 'lodash'
import { createMigrate, getStoredState, PersistConfig, PersistedState, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

type TApplicationDataByLoginType = {
  [K in TLoginSessionType]: {
    wallets: IWalletState[]
    notifications: TNotification[]
  }
}

export interface IAuthReducer {
  currentLoginSession?: TLoginSession
  pendingTransactions: TUseTransactionsTransfer[]
  data: {
    swapRecords: TSwapRecord[]
    applicationDataByLoginType: TApplicationDataByLoginType
    lastIndexesByWallet: TLastIndexesByWallet
  }
}

const authReducerMigrations = {
  0: (state: any) => {
    const walletsStore = window.localStorage.getItem('persist:walletReducer')
    const accountsStore = window.localStorage.getItem('persist:accountReducer')

    const passwordWallets: IWalletState[] = []
    const walletsJSON: any[] = walletsStore ? JSON.parse(JSON.parse(walletsStore).data) : []
    const accountsJSON: any[] = accountsStore ? JSON.parse(JSON.parse(accountsStore).data) : []

    walletsJSON.forEach(wallet => {
      wallet.type = wallet.type === 'ledger' ? 'hardware' : wallet.type

      const accounts: any[] = []
      accountsJSON.forEach(account => {
        if (account.idWallet !== wallet.id) return

        account.type = account.type === 'ledger' ? 'hardware' : account.type

        accounts.push(account)
      })

      passwordWallets.push({
        ...wallet,
        accounts,
      })
    })

    window.localStorage.removeItem('persist:walletReducer')
    window.localStorage.removeItem('persist:accountReducer')

    return {
      ...state,
      data: {
        ...state.data,
        applicationDataByLoginType: {
          ...state.data.applicationDataByLoginType,
          password: { ...state.data.applicationDataByLoginType.password, wallets: passwordWallets },
        },
      },
    }
  },
  1: (state: any) => {
    return {
      ...state,
      data: {
        ...state.data,
        swapRecords: [],
        applicationDataByLoginType: {
          ...state.data.applicationDataByLoginType,
          password: {
            ...state.data.applicationDataByLoginType.password,
            wallets: state.data.applicationDataByLoginType.password.wallets.map((wallet: any) => ({
              ...wallet,
              accounts: wallet.accounts.map((account: any) => {
                delete account.lastNftSkin

                return account
              }),
            })),
          },
        },
      },
    }
  },
  2: (state: any) => {
    return {
      ...state,
      data: {
        ...state.data,
        lastIndexesByWallet: {},
      },
    }
  },
  3: (state: any) => {
    const applicationDataByLoginType = Object.keys(state.data.applicationDataByLoginType).reduce((acc, key) => {
      const loginType = key as TLoginSessionType
      const applicationData = state.data.applicationDataByLoginType[loginType]

      acc[loginType] = {
        ...applicationData,
        notifications: [],
      }

      return acc
    }, {} as TApplicationDataByLoginType)

    return {
      ...state,
      data: {
        ...state.data,
        applicationDataByLoginType,
      },
    }
  },
}

export const authReducerConfig: PersistConfig<IAuthReducer> = {
  key: 'authReducer',
  storage: storage,
  blacklist: ['currentLoginSession', 'pendingTransactions'],
  version: 3,
  migrate: createMigrate(authReducerMigrations),
  // It is necessary to check if the stored state is empty, because the redux-persist library does not call the migrate function when the state is empty
  getStoredState: async config => {
    const storedState = await config.storage.getItem('persist:authReducer')
    if (storedState) {
      return (await getStoredState(config)) as PersistedState
    }

    return {
      ...initialState,
      _persist: {
        rehydrated: true,
        version: -1,
      },
    }
  },
}

const initialState: IAuthReducer = {
  currentLoginSession: undefined,
  pendingTransactions: [],
  data: {
    swapRecords: [],
    applicationDataByLoginType: {
      hardware: { wallets: [], notifications: [] },
      key: { wallets: [], notifications: [] },
      password: { wallets: [], notifications: [] },
    },
    lastIndexesByWallet: {},
  },
}

// Generic Reducers
const setCurrentLoginSession: CaseReducer<IAuthReducer, PayloadAction<TLoginSession | undefined>> = (state, action) => {
  state.currentLoginSession = action.payload
}

const resetTemporaryApplicationData: CaseReducer<IAuthReducer> = state => {
  state.data.applicationDataByLoginType.hardware = { wallets: [], notifications: [] }
  state.data.applicationDataByLoginType.key = { wallets: [], notifications: [] }
}

// Pending Transaction Reducers
const addPendingTransaction: CaseReducer<IAuthReducer, PayloadAction<TUseTransactionsTransfer>> = (state, action) => {
  state.pendingTransactions = [...state.pendingTransactions, action.payload]
}

const removePendingTransaction: CaseReducer<IAuthReducer, PayloadAction<string>> = (state, action) => {
  state.pendingTransactions = state.pendingTransactions.filter(transaction => transaction.hash !== action.payload)
}

// Wallet Reducers
const saveWallet: CaseReducer<IAuthReducer, PayloadAction<IWalletState>> = (state, action) => {
  if (!state.currentLoginSession) {
    throw new Error('Error to save wallet: Current login session is not defined')
  }

  const loginSessionType = state.currentLoginSession.type
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
  if (!state.currentLoginSession) {
    throw new Error('Error to delete wallet: Current login session is not defined')
  }

  const loginSessionType = state.currentLoginSession.type
  const walletId = action.payload
  const applicationData = state.data.applicationDataByLoginType[loginSessionType]

  applicationData.wallets = applicationData.wallets.filter(it => it.id !== walletId)
}

// Account Reducers
const saveAccount: CaseReducer<IAuthReducer, PayloadAction<IAccountState>> = (state, action) => {
  if (!state.currentLoginSession) {
    throw new Error('Error to save account: Current login session is not defined')
  }

  const loginSessionType = state.currentLoginSession.type
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
  if (!state.currentLoginSession) {
    throw new Error('Error to delete account: Current login session is not defined')
  }

  const loginSessionType = state.currentLoginSession.type
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
  if (!state.currentLoginSession) {
    throw new Error('Error to delete account: Current login session is not defined')
  }

  const invalidSkinIds = action.payload
  const applicationDataByLoginTypeCloned = cloneDeep(state.data.applicationDataByLoginType)

  applicationDataByLoginTypeCloned[state.currentLoginSession.type]?.wallets?.forEach((wallet: any) =>
    wallet.accounts.forEach((account: any) => {
      if (invalidSkinIds.includes(account.skin.id)) account.skin = UtilsHelper.generateColorSkin()
    })
  )

  state.data.applicationDataByLoginType = applicationDataByLoginTypeCloned
}

// Swap Reducers
const persistSwapRecord: CaseReducer<IAuthReducer, PayloadAction<TSwapRecord>> = (state, action) => {
  const swapRecord = cloneDeep(action.payload)

  // We don't want to save this long information in the storage
  swapRecord.log = undefined

  const index = state.data.swapRecords.findIndex(
    it => it.swapId === swapRecord.swapId && it.swapProvider === swapRecord.swapProvider
  )

  if (index === -1) {
    state.data.swapRecords = [...state.data.swapRecords, swapRecord]
    return
  }

  state.data.swapRecords[index] = swapRecord
}

// Notification Reducers
const saveNotification: CaseReducer<IAuthReducer, PayloadAction<TSaveNotification>> = (state, action) => {
  const loginSessionType = state.currentLoginSession?.type ?? 'password'

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

const saveLastIndexByWallet: CaseReducer<
  IAuthReducer,
  PayloadAction<{
    index: number
    firstAccountAddress: string
    blockchain: TBlockchainServiceKey
  }>
> = (state, action) => {
  const { firstAccountAddress, index, blockchain } = action.payload
  state.data.lastIndexesByWallet[blockchain] = {
    ...state.data.lastIndexesByWallet[blockchain],
    [firstAccountAddress]: index,
  }
}

const AuthReducer = createSlice({
  name: authReducerConfig.key,
  initialState,
  reducers: {
    saveWallet,
    deleteWallet,
    saveAccount,
    deleteAccount,
    setCurrentLoginSession,
    resetTemporaryApplicationData,
    persistSwapRecord,
    removeAccountSkins,
    saveLastIndexByWallet,
    saveNotification,
    addPendingTransaction,
    removePendingTransaction,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState)
  },
})

export const authReducerActions = {
  ...AuthReducer.actions,
}

export default AuthReducer.reducer
