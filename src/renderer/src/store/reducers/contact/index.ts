import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, PersistConfig, persistReducer, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

import { IContactState, TContactEncryptedAddress } from '@shared/types/store'

import { contactSliceReducers } from './reducers'

export interface IContactReducer {
  data: IContactState<TContactEncryptedAddress>[]
}

export let contactReducerActions: CaseReducerActions<typeof contactSliceReducers, string>

export function getContactReducer() {
  const contactReducerInitialState = {
    data: [],
  } as IContactReducer

  const contactReducerMigrations = {
    0: (state: any) => ({
      ...state,
      data: ContactsHelper.encryptContacts(state.data),
    }),
  }

  const contactReducerConfig: PersistConfig<IContactReducer> = {
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

  contactReducerActions = contactSlice.actions

  const persistedContactReducer = persistReducer(contactReducerConfig, contactSlice.reducer)

  return persistedContactReducer
}
