import { TLoginSessionType, TWallet } from '@shared/types/store'

import { TApplicationDataByLoginType } from './index'

export function getAuthMigrations() {
  return {
    0: (state: any) => {
      const walletsStore = window.localStorage.getItem('persist:walletReducer')
      const accountsStore = window.localStorage.getItem('persist:accountReducer')

      const passwordWallets: TWallet[] = []
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
    6: (state: any) => {
      const currentApplicationDataByLoginType = state.data.applicationDataByLoginType
      const applicationDataByLoginType = Object.keys(currentApplicationDataByLoginType).reduce((accumulator, key) => {
        const loginType = key as TLoginSessionType
        const applicationData = currentApplicationDataByLoginType[loginType]

        accumulator[loginType] = {
          ...applicationData,
          notifications: applicationData.notifications.filter(
            (notification: any) => notification?.action?.payload?.to !== 'migration-neo3'
          ),
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
    7: (state: any) => {
      return {
        ...state,
        data: {
          ...state.data,
          applicationDataByLoginType: {
            ...state.data.applicationDataByLoginType,
            password: {
              ...state.data.applicationDataByLoginType.password,
              notifications: state.data.applicationDataByLoginType.password.notifications.map(notification => ({
                ...notification,
                date: new Date(notification.date * 1000).toJSON(),
              })),
            },
          },
        },
      }
    },
    8: (state: any) => {
      const currentApplicationDataByLoginType = state.data.applicationDataByLoginType
      const applicationDataByLoginType = Object.keys(currentApplicationDataByLoginType).reduce((accumulator, key) => {
        const loginType = key as TLoginSessionType
        const applicationData = currentApplicationDataByLoginType[loginType]

        accumulator[loginType] = {
          ...applicationData,
          shouldConfirmAction: loginType !== 'hardware',
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
    9: (state: any) => {
      const currentApplicationDataByLoginType = state.data.applicationDataByLoginType
      const applicationDataByLoginType = Object.keys(currentApplicationDataByLoginType).reduce((accumulator, key) => {
        const loginType = key as TLoginSessionType
        const applicationData = currentApplicationDataByLoginType[loginType]

        accumulator[loginType] = {
          ...applicationData,
          conversations: [],
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
  }
}
