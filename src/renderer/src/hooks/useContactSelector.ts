import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

import { createAppSelector, useAppSelector } from './useRedux'

const selectContacts = createAppSelector([state => state.contact.data], data => ContactsHelper.decryptContacts(data))

export const useContactsSelector = () => {
  const { value, ref } = useAppSelector(selectContacts)

  return {
    contacts: value,
    contactsRef: ref,
  }
}
