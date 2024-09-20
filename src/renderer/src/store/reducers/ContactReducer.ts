import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IContactState } from '@shared/@types/store'
import { PersistConfig, PURGE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export interface IContactReducer {
  data: IContactState[]
}

export const contactReducerConfig: PersistConfig<IContactReducer> = {
  key: 'contactReducer',
  storage: storage,
}

const initialState = {
  data: [],
} as IContactReducer

const saveContact: CaseReducer<IContactReducer, PayloadAction<IContactState>> = (state, action) => {
  const contact = action.payload

  const findIndex = state.data.findIndex(it => it.id === contact.id)
  if (findIndex < 0) {
    state.data = [...state.data, contact]
    return
  }

  state.data[findIndex] = contact
}

const deleteContact: CaseReducer<IContactReducer, PayloadAction<string>> = (state, action) => {
  const idContact = action.payload
  state.data = state.data.filter(contact => contact.id !== idContact)
}

const ContactReducer = createSlice({
  name: contactReducerConfig.key,
  initialState,
  reducers: {
    saveContact,
    deleteContact,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState)
  },
})

export const contactReducerActions = {
  ...ContactReducer.actions,
}
export default ContactReducer.reducer
