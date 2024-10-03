import { useMemo } from 'react'
import { ContactsHelper } from '@renderer/helpers/ContactsHelper'
import { IContactState, TContactEncryptedAddress } from '@shared/@types/store'

import { useAppSelector } from './useRedux'

export const useContactsSelector = () => {
  const { value, ref } = useAppSelector<IContactState<TContactEncryptedAddress>[]>(state => state.contact.data)
  const contacts = useMemo(() => ContactsHelper.decryptContacts(value), [value])
  const contactsRef = useMemo(() => ({ ...ref, current: ContactsHelper.decryptContacts(ref.current) }), [ref])

  return {
    contacts,
    contactsRef,
  }
}

export const useContactByIdSelector = (id: string) => {
  const { value, ref } = useAppSelector(state => state.contact.data)

  const contactById = useMemo(() => value.find(contact => contact.id === id), [value, id])

  const contactByIdRef = useMemo(() => ref.current.find(contact => contact.id === id), [ref, id])

  return {
    contactById,
    contactByIdRef,
  }
}
