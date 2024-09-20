import { CaseReducer, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IWalletState } from '@shared/@types/store'
import { createMigrate, PersistConfig, PURGE } from 'redux-persist'
import getStoredState from 'redux-persist/es/getStoredState'
import storage from 'redux-persist/lib/storage'

export interface IWalletReducer {
  data: IWalletState[]
}

export const walletReducerMigrations = {
  0: (state: any) => {
    return {
      ...state,
      data: state.data.map((it: any) => {
        return {
          ...it,
          type: it.type === 'ledger' ? 'hardware' : it.type,
        }
      }),
    }
  },
}

export const walletReducerConfig: PersistConfig<IWalletReducer> = {
  key: 'walletReducer',
  storage: storage,
  migrate: createMigrate(walletReducerMigrations),
  version: 0,
}

const initialState = {
  data: [],
} as IWalletReducer

const saveWallet: CaseReducer<IWalletReducer, PayloadAction<IWalletState>> = (state, action) => {
  const wallet = action.payload

  const indexWallet = state.data.findIndex(it => it.id === wallet.id)
  if (indexWallet < 0) {
    state.data = [...state.data, wallet]
    return
  }

  state.data[indexWallet] = wallet
}

const replaceAllWallets: CaseReducer<IWalletReducer, PayloadAction<IWalletState[]>> = (state, action) => {
  state.data = action.payload
}

const deleteWallet: CaseReducer<IWalletReducer, PayloadAction<string>> = (state, action) => {
  const idWallet = action.payload
  state.data = state.data.filter(it => it.id !== idWallet)
}

const clean: CaseReducer<IWalletReducer> = () => {
  return initialState
}

const restoreToPersistedData = createAsyncThunk('wallets/restoreToPersistedData', async () => {
  const persistedState = await getStoredState(walletReducerConfig)
  if (!persistedState) throw new Error('No persisted state found')

  return persistedState as any
})

const WalletReducer = createSlice({
  initialState,
  name: walletReducerConfig.key,
  reducers: {
    deleteWallet,
    saveWallet,
    replaceAllWallets,
    clean,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState)
    builder.addCase(restoreToPersistedData.fulfilled, (state, action) => {
      state.data = action.payload.data
    })
  },
})

export const WalletReducerSlice = WalletReducer

export const walletReducerActions = {
  ...WalletReducer.actions,
  restoreToPersistedData,
}

export default WalletReducer.reducer
