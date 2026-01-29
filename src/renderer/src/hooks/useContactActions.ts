import { useCallback } from 'react'

import { contactReducerActions } from '@renderer/store/reducers/contact'
import { IContactState } from '@shared/types/store'

import { useAppDispatch } from './useRedux'

export const useCreateContacts = () => {
  const dispatch = useAppDispatch()

  const createContacts = useCallback(
    (contacts: IContactState[]) => contacts.forEach(contact => dispatch(contactReducerActions.saveContact(contact))),
    [dispatch]
  )

  return { createContacts }
}
