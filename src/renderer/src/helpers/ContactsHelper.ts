import { TContact, TContactEncryptedAddress } from '@shared/types/store'

export class ContactsHelper {
  static encryptContact(contact: TContact): TContact<TContactEncryptedAddress> {
    return {
      ...contact,
      addresses: contact.addresses.map(({ address, ...contactAddress }) => ({
        ...contactAddress,
        encryptedAddress: window.api.sendSync('encryption:encryptBasedOSSync', address),
      })),
    }
  }

  static encryptContacts(contacts: TContact[]): TContact<TContactEncryptedAddress>[] {
    return contacts.map(ContactsHelper.encryptContact)
  }

  static decryptContacts(contacts: TContact<TContactEncryptedAddress>[]): TContact[] {
    return contacts.map(({ addresses, ...contact }) => ({
      ...contact,
      addresses: addresses.map(({ encryptedAddress, ...contactAddress }) => ({
        ...contactAddress,
        address: window.api.sendSync('encryption:decryptBasedOSSync', encryptedAddress),
      })),
    }))
  }
}
