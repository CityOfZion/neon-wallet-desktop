import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

import { IContactState, TContactEncryptedAddress } from '@shared/@types/store'

import { IContactReducer } from '.'

const saveContact: CaseReducer<IContactReducer, PayloadAction<IContactState>> = (state, action) => {
  const contact: IContactState<TContactEncryptedAddress> = ContactsHelper.encryptContact(cloneDeep(action.payload))
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

export const contactSliceReducers = {
  saveContact,
  deleteContact,
}
