import { IContactState, TContactEncryptedAddress } from '@shared/@types/store'

export class ContactsHelper {
  static encryptContact(contact: IContactState): IContactState<TContactEncryptedAddress> {
    return {
      ...contact,
      addresses: contact.addresses.map(({ address, ...contactAddress }) => ({
        ...contactAddress,
        encryptedAddress: window.api.sendSync('encryptBasedOSSync', address),
      })),
    }
  }

  static encryptContacts(contacts: IContactState[]): IContactState<TContactEncryptedAddress>[] {
    return contacts.map(ContactsHelper.encryptContact)
  }

  static decryptContacts(contacts: IContactState<TContactEncryptedAddress>[]): IContactState[] {
    return contacts.map(({ addresses, ...contact }) => ({
      ...contact,
      addresses: addresses.map(({ encryptedAddress, ...contactAddress }) => ({
        ...contactAddress,
        address: window.api.sendSync('decryptBasedOSSync', encryptedAddress),
      })),
    }))
  }
}
