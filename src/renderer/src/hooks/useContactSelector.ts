import { useMemo } from 'react'
import { ContactsHelper } from '@renderer/helpers/ContactsHelper'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { createAppSelector, useAppSelector } from './useRedux'

const selectContacts = createAppSelector([state => state.contact.data], data => ContactsHelper.decryptContacts(data))

export const useContactsSelector = () => {
  const { value, ref } = useAppSelector(selectContacts)

  return {
    contacts: value,
    contactsRef: ref,
  }
}

export const useHasContactsByBlockchain = (blockchain?: TBlockchainServiceKey) => {
  const { contacts } = useContactsSelector()

  const hasContactsByBlockchain = useMemo(() => {
    if (!blockchain) return false

    return contacts.flatMap(contact => contact.addresses.map(address => address.blockchain)).includes(blockchain)
  }, [blockchain, contacts])

  return { hasContactsByBlockchain }
}
