import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ActionPopover } from '@renderer/components/ActionPopover'
import { Button } from '@renderer/components/Button'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { ContactAddressTable } from '@renderer/components/ContactAddressTable'
import { ContactList } from '@renderer/components/ContactList'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { MainLayout } from '@renderer/layouts/Main'

import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { TContact } from '@shared/types/store'

const ContactsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'contacts' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { contacts } = useContactsSelector()
  const [selectedContact, setSelectedContact] = useState<TContact | null>(null)

  useEffect(() => {
    setSelectedContact(previousSelectedContact => {
      if (!previousSelectedContact) return null

      return contacts.find(({ id }) => id === previousSelectedContact.id) || null
    })
  }, [contacts])

  return (
    <MainLayout
      heading={t('title')}
      rightComponent={
        <CommonScreenActions>
          <ActionPopover.Item
            actionPopoverItemType="button"
            leftIcon={<TbPlus aria-hidden className="text-neon" />}
            label={t('buttonAddContactLabel')}
            onClick={modalNavigateWrapper('persist-contact')}
            colorSchema="white"
            {...TestHelper.buildTestObject('add-contact-button')}
          />

          <ActionPopover.Separator />
        </CommonScreenActions>
      }
    >
      <section className="flex h-full w-full rounded-sm bg-gray-800">
        <div className="flex w-full max-w-[17.188rem] flex-col items-center border-r border-gray-300/15 px-4">
          <div className="h-[3.25rem]a mt-2 mb-9 flex w-full flex-col gap-y-1">
            <span className="flex h-10 w-full items-center justify-between text-sm">{t('listTitle')}</span>
            <Separator />
          </div>

          <ContactList onContactSelected={setSelectedContact} selectedContact={selectedContact} contacts={contacts} />
        </div>

        {selectedContact && (
          <div className="w-full px-4">
            <div className="mt-2 mb-5 flex h-13 flex-col gap-y-1">
              <div
                className="flex h-10 w-full items-center justify-between"
                {...TestHelper.buildTestObject('contact-name-title')}
              >
                {StringHelper.truncateMiddle(selectedContact.name, 70)}

                <Button
                  leftIcon={<TbPencil className="text-neon" />}
                  label={tCommonGeneral('edit')}
                  variant="text"
                  colorSchema="gray"
                  onClick={modalNavigateWrapper('persist-contact', { state: { contact: selectedContact } })}
                  flat
                  {...TestHelper.buildTestObject('edit-contact-button')}
                />
              </div>
              <Separator />
            </div>

            <ContactAddressTable contactAddresses={selectedContact.addresses} />
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default ContactsPage
