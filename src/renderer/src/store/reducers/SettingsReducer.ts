import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TNetworkType } from '@renderer/@types/blockchain'
import { ISettingsState, TCurrency, TSecurityType } from '@renderer/@types/store'
import { availableCurrencies } from '@renderer/constants/currency'

export const settingsReducerName = 'settingsReducer'

const initialState: ISettingsState = {
  encryptedPassword: undefined,
  securityType: 'none',
  isFirstTime: true,
  networkType: 'mainnet',
  currency: availableCurrencies[0],
}

const setEncryptedPassword: CaseReducer<ISettingsState, PayloadAction<string | undefined>> = (state, action) => {
  state.encryptedPassword = action.payload
}

const setIsFirstTime: CaseReducer<ISettingsState, PayloadAction<boolean>> = (state, action) => {
  state.isFirstTime = action.payload
}

const setSecurityType: CaseReducer<ISettingsState, PayloadAction<TSecurityType>> = (state, action) => {
  state.securityType = action.payload
}

const setNetworkType: CaseReducer<ISettingsState, PayloadAction<TNetworkType>> = (state, action) => {
  state.networkType = action.payload
}

const setCurrency: CaseReducer<ISettingsState, PayloadAction<TCurrency>> = (state, action) => {
  state.currency = action.payload
}

const SettingsReducer = createSlice({
  name: settingsReducerName,
  initialState,
  reducers: {
    setIsFirstTime,
    setSecurityType,
    setEncryptedPassword,
    setNetworkType,
    setCurrency,
  },
})

export const settingsReducerActions = {
  ...SettingsReducer.actions,
}

export default SettingsReducer.reducer
