import { createSlice } from '@reduxjs/toolkit'
import { ContactsHelper } from '@renderer/helpers/ContactsHelper'
import { IContactState, TContactEncryptedAddress } from '@shared/@types/store'
import { createMigrate, PersistConfig, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { contactSliceReducers } from './reducers'

export interface IContactReducer {
  data: IContactState<TContactEncryptedAddress>[]
}

const contactReducerInitialState = {
  data: [],
} as IContactReducer

const contactReducerMigrations = {
  0: (state: any) => ({
    ...state,
    data: ContactsHelper.encryptContacts(state.data),
  }),
}

export const contactReducerConfig: PersistConfig<IContactReducer> = {
  key: 'contactReducer',
  storage,
  migrate: createMigrate(contactReducerMigrations),
  version: 0,
}

const contactSlice = createSlice({
  name: contactReducerConfig.key,
  initialState: contactReducerInitialState,
  reducers: contactSliceReducers,
  extraReducers: builder => {
    builder.addCase(PURGE, () => contactReducerInitialState)
  },
})

export const contactReducerActions = contactSlice.actions
export const contactReducer = contactSlice.reducer
