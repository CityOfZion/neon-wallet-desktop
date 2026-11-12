import type { TBSServiceName } from '@cityofzion/bs-multichain'

import { ContactsHelper } from '@renderer/helpers/ContactsHelper'
import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import { TContact } from '@shared/types/store'

import { createAppSelector, useAppSelector } from './useRedux'

const selectContacts = createAppSelector([state => state.contact.data], data =>
  SelectorHelper.fallbackToEmptyArray<TContact>(ContactsHelper.decryptContacts(data))
)

export const useContactsSelector = () => {
  const { value, ref } = useAppSelector(selectContacts)

  return {
    contacts: value,
    contactsRef: ref,
  }
}

const hasContactsByBlockchainSelector = (blockchain?: TBSServiceName) =>
  createAppSelector([state => state.contact.data], data => {
    if (!blockchain) return false

    return data.flatMap(contact => contact.addresses.map(address => address.blockchain)).includes(blockchain)
  })

export const useHasContactsByBlockchain = (blockchain?: TBSServiceName) => {
  const { value: hasContactsByBlockchain } = useAppSelector(hasContactsByBlockchainSelector(blockchain))

  return { hasContactsByBlockchain }
}
