import { type CaseReducerActions, createSlice } from '@reduxjs/toolkit'
import { createMigrate, PersistConfig, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { IContactState, TContactEncryptedAddress } from '@shared/types/store'

import { getContactMigrations } from './migrations'
import { contactSliceReducers } from './reducers'

export interface IContactReducer {
  data: IContactState<TContactEncryptedAddress>[]
}

export let contactReducerActions: CaseReducerActions<typeof contactSliceReducers, string>

export function getContactReducer() {
  const contactMigrations = getContactMigrations()

  const contactReducerInitialState = {
    data: [],
  } as IContactReducer

  const contactReducerConfig: PersistConfig<IContactReducer> = {
    key: 'contactReducer',
    storage,
    migrate: createMigrate(contactMigrations),
    version: 0,
  }

  const contactSlice = createSlice({
    name: contactReducerConfig.key,
    initialState: contactReducerInitialState,
    reducers: contactSliceReducers,
  })

  contactReducerActions = contactSlice.actions

  return persistReducer(contactReducerConfig, contactSlice.reducer)
}
