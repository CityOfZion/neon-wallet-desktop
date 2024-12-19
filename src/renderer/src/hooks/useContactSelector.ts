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

const hasContactsByBlockchainSelector = (blockchain?: string) =>
  createAppSelector([state => state.contact.data], data => {
    if (!blockchain) return false

    return data.flatMap(contact => contact.addresses.map(address => address.blockchain)).includes(blockchain)
  })

export const useHasContactsByBlockchain = (blockchain?: TBlockchainServiceKey) => {
  const { value: hasContactsByBlockchain } = useAppSelector(hasContactsByBlockchainSelector(blockchain))

  return { hasContactsByBlockchain }
}
