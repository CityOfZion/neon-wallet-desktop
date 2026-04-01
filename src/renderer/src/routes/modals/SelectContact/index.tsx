import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { ContactList } from '@renderer/components/ContactList'

import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'

import type { TModalState } from '@shared/types/modal'
import { TContact, TContactAddress } from '@shared/types/store'

const SelectContact = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'selectContact' })
  const { modalNavigate } = useModalNavigate()
  const { blockchain, onSelectContact } = useModalState<TModalState<'select-contact'>>()
  const { contacts } = useContactsSelector()

  const [selectedContact, setSelectedContact] = useState<TContact | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<TContactAddress | null>(null)

  const selectRecipient = () => {
    if (!selectedAddress) {
      return
    }
    onSelectContact(selectedAddress)
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbStepOut />}>
      <ContactList
        onContactSelected={setSelectedContact}
        onAddressSelected={setSelectedAddress}
        contacts={contacts}
        selectedAddress={selectedAddress}
        selectedContact={selectedContact}
        showSelectedAddress
        blockchainFilter={blockchain}
      >
        <Button
          className="mt-10 w-[16rem]"
          type="submit"
          label={t('selectRecipient')}
          disabled={!selectedAddress}
          onClick={selectRecipient}
        />
      </ContactList>
    </SideModalLayout>
  )
}

export default SelectContact
