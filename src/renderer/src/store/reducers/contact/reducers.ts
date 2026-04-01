import { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

import { TContact, TContactEncryptedAddress } from '@shared/types/store'

import { TContactReducer } from '.'

const saveContact: CaseReducer<TContactReducer, PayloadAction<TContact>> = (state, action) => {
  const contact = action.payload

  if (!contact.name?.trim() || contact.addresses.length === 0 || !contact.id?.trim()) return

  const encryptedContact: TContact<TContactEncryptedAddress> = ContactsHelper.encryptContact(cloneDeep(contact))
  const findIndex = state.data.findIndex(({ id }) => id === contact.id)

  if (findIndex < 0) {
    state.data = [...state.data, encryptedContact]
    return
  }

  state.data[findIndex] = encryptedContact
}

const deleteContact: CaseReducer<TContactReducer, PayloadAction<string>> = (state, action) => {
  const contactId = action.payload

  state.data = state.data.filter(contact => contact.id !== contactId)
}

export const contactSliceReducers = {
  saveContact,
  deleteContact,
}
