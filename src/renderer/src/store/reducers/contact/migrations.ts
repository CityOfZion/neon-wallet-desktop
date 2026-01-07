import { ContactsHelper } from '@renderer/helpers/ContactsHelper'

export function getContactMigrations() {
  return {
    0: (state: any) => ({
      ...state,
      data: ContactsHelper.encryptContacts(state.data),
    }),
  }
}
