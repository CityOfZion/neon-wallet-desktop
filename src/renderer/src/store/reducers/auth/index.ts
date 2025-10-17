import { CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, getStoredState, PersistConfig, PersistedState, persistReducer, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { IWalletState, TLoginSession, TLoginSessionType, TNotification } from '@shared/@types/store'

import { authSliceReducers } from './reducers'

type TApplicationDataByLoginType = {
  [K in TLoginSessionType]: {
    wallets: IWalletState[]
    notifications: TNotification[]
  }
}

export interface IAuthReducer {
  inMemoryData: {
    currentLoginSession?: TLoginSession
  }
  data: {
    applicationDataByLoginType: TApplicationDataByLoginType
  }
}

export let authReducerActions: CaseReducerActions<typeof authSliceReducers, string>

export function getAuthReducer() {
  const authReducerInitialState: IAuthReducer = {
    inMemoryData: {
      currentLoginSession: undefined,
    },
    data: {
      applicationDataByLoginType: {
        hardware: { wallets: [], notifications: [] },
        key: { wallets: [], notifications: [] },
        password: { wallets: [], notifications: [] },
      },
    },
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
      const applicationDataByLoginType = Object.keys(state.data.applicationDataByLoginType).reduce((acc, key) => {
        const loginType = key as TLoginSessionType
        const applicationData = state.data.applicationDataByLoginType[loginType]

        acc[loginType] = {
          ...applicationData,
          notifications: [],
        }

        return acc
      }, {} as TApplicationDataByLoginType)

      delete state.data.swapRecords

      return {
        ...state,
        data: {
          ...state.data,
          applicationDataByLoginType,
        },
      }
    },
    3: (state: any) => {
      const currentApplicationDataByLoginType = state.data.applicationDataByLoginType
      const applicationDataByLoginType = Object.keys(currentApplicationDataByLoginType).reduce((accumulator, key) => {
        const loginType = key as TLoginSessionType
        const applicationData = currentApplicationDataByLoginType[loginType]

        accumulator[loginType] = {
          ...applicationData,
          notifications: applicationData.notifications.map((notification: any) => {
            const action = notification?.action
            const payload = action?.payload

            if (action?.type === 'navigate' && payload?.to === 'account-tokens') {
              return { ...notification, action: { ...action, payload: { ...payload, to: 'hide-fraudulent-token' } } }
            }

            return notification
          }),
        }

        return accumulator
      }, {} as TApplicationDataByLoginType)

      return {
        ...state,
        data: {
          ...state.data,
          applicationDataByLoginType,
        },
      }
    },
    4: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        applicationDataByLoginType: {
          ...state.data.applicationDataByLoginType,
          password: {
            ...state.data.applicationDataByLoginType.password,
            wallets: state.data.applicationDataByLoginType.password.wallets.map((wallet: any) => {
              wallet.backupStatus = 'unsuccessful'

              return wallet
            }),
          },
        },
      },
    }),
    5: (state: any) => ({
      ...state,
      data: {
        ...state.data,
        applicationDataByLoginType: {
          ...state.data.applicationDataByLoginType,
          password: {
            ...state.data.applicationDataByLoginType.password,
            notifications: [],
          },
        },
      },
    }),
  }

  const authReducerConfig: PersistConfig<IAuthReducer> = {
    key: 'authReducer',
    storage: storage,
    blacklist: ['inMemoryData'],
    version: 5,
    migrate: createMigrate(authReducerMigrations),
    // It is necessary to check if the stored state is empty, because the redux-persist library does not call the migrate function when the state is empty
    getStoredState: async config => {
      const storedState = await config.storage.getItem('persist:authReducer')

      if (storedState) {
        return (await getStoredState(config)) as PersistedState
      }

      return {
        ...authReducerInitialState,
        _persist: {
          rehydrated: true,
          version: -1,
        },
      }
    },
  }

  const authSlice = createSlice({
    name: authReducerConfig.key,
    initialState: authReducerInitialState,
    reducers: authSliceReducers,
    extraReducers: builder => {
      builder.addCase(PURGE, () => authReducerInitialState)
    },
  })

  authReducerActions = authSlice.actions

  const persistedAuthReducer = persistReducer(authReducerConfig, authSlice.reducer)

  return persistedAuthReducer
}
