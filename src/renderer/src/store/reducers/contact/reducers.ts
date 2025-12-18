import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

import { IContactState, TContactEncryptedAddress } from '@shared/types/store'

import { IContactReducer } from '.'

const saveContact: CaseReducer<IContactReducer, PayloadAction<IContactState>> = (state, action) => {
  const contact = action.payload
  if (!contact.name?.trim() || contact.addresses.length === 0 || !contact.id?.trim()) return

  const encryptedContact: IContactState<TContactEncryptedAddress> = ContactsHelper.encryptContact(cloneDeep(contact))
  const findIndex = state.data.findIndex(it => it.id === contact.id)

  if (findIndex < 0) {
    state.data = [...state.data, encryptedContact]
    return
  }

  state.data[findIndex] = encryptedContact
}

const deleteContact: CaseReducer<IContactReducer, PayloadAction<string>> = (state, action) => {
  const idContact = action.payload
  state.data = state.data.filter(contact => contact.id !== idContact)
}

export const contactSliceReducers = {
  saveContact,
  deleteContact,
}
