import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPencil, TbPlus } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { ContactAddressTable } from '@renderer/components/ContactAddressTable'
import { ContactList } from '@renderer/components/ContactList'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useContactsSelector } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { MainLayout } from '@renderer/layouts/Main'
import { IContactState } from '@shared/@types/store'

export const ContactsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'contacts' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { contacts } = useContactsSelector()
  const [selectedContact, setSelectedContact] = useState<IContactState | null>(null)

  useEffect(() => {
    setSelectedContact(previousSelectedContact => {
      if (!previousSelectedContact) return null

      return contacts.find(({ id }) => id === previousSelectedContact.id) ?? null
    })
  }, [contacts])

  return (
    <MainLayout
      heading={t('title')}
      rightComponent={
        <IconButton
          icon={<TbPlus className="text-neon" />}
          size="md"
          className="text-neon"
          text={t('buttonAddContactLabel')}
          onClick={modalNavigateWrapper('persist-contact')}
          {...TestHelper.buildTestObject('add-contact-action')}
        />
      }
    >
      <section className="bg-gray-800 w-full h-full flex rounded">
        <div className="w-full max-w-[17.188rem] px-4 border-r border-gray-300/15 flex flex-col items-center">
          <div className="flex flex-col gap-y-1 mt-2 mb-9 h-[3.25rem]a w-full">
            <span className="w-full h-10 flex items-center justify-between  text-sm">{t('listTitle')}</span>
            <Separator />
          </div>

          <ContactList onContactSelected={setSelectedContact} selectedContact={selectedContact} contacts={contacts} />
        </div>

        {selectedContact && (
          <div className="w-full px-4">
            <div className="flex flex-col gap-y-1 mt-2 mb-5 h-[3.25rem]">
              <div
                className="w-full h-10 flex items-center justify-between"
                {...TestHelper.buildTestObject('contact-name-title')}
              >
                {StringHelper.truncateStringMiddle(selectedContact.name, 70)}
                <Button
                  leftIcon={<TbPencil className="text-neon" />}
                  label={commonGeneral('edit')}
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
