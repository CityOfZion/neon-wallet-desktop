import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCheck, TbChevronUp } from 'react-icons/tb'
import { SearchInput } from '@renderer/components/SearchInput'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IContactState, TContactAddress } from '@shared/@types/store'
import { cloneDeep } from 'lodash'

import { BlockchainIcon } from './BlockchainIcon'
import { Separator } from './Separator'

type TProps = {
  onContactSelected?: (contact: IContactState | null) => void
  onAddressSelected?: (address: TContactAddress | null) => void
  selectedContact?: IContactState | null
  selectedAddress?: TContactAddress | null
  contacts: IContactState[]
  showSelectedAddress?: boolean
  blockchainFilter?: TBlockchainServiceKey
  children?: React.ReactNode
}

export const ContactList = ({
  onContactSelected,
  onAddressSelected,
  selectedAddress,
  selectedContact,
  showSelectedAddress = false,
  contacts,
  blockchainFilter,
  children,
}: TProps) => {
  const { t: contactT } = useTranslation('components', { keyPrefix: 'contacts' })
  const [search, setSearch] = useState<string | null>(null)
  const hasAlreadySelectedContact = useRef(false)

  const handleAddressSelected = (address: TContactAddress | null) => {
    onAddressSelected && onAddressSelected(address)
  }

  const handleContactSelected = (contact: IContactState | null) => {
    handleAddressSelected(null)
    onContactSelected && onContactSelected(contact)
  }

  const getInitialsLetters = (contact: IContactState) => {
    const splitName = contact.name.trim().split(' ')
    const initials = splitName[0][0] + splitName[splitName.length - 1][0]
    return initials.toUpperCase()
  }

  const filteredSelectedContactAddresses = useMemo(() => {
    if (!selectedContact) return

    let filtered = cloneDeep(selectedContact.addresses)

    if (blockchainFilter) {
      filtered = filtered?.filter(address => address.blockchain === blockchainFilter)
    }

    return filtered
  }, [selectedContact, blockchainFilter])

  const groupContactsByFirstLetter = useMemo(() => {
    let filteredContacts = cloneDeep(contacts)

    if (blockchainFilter) {
      filteredContacts = contacts.filter(contact =>
        contact.addresses.some(address => address.blockchain === blockchainFilter)
      )
    }

    const newSearch = search?.toLocaleLowerCase()?.trim()

    if (newSearch)
      filteredContacts = contacts.filter(contact =>
        contact.name
          .toLocaleLowerCase()
          .trim()
          .includes(newSearch as string)
      )

    const sortedContacts = filteredContacts.sort((a, b) => a.name[0].localeCompare(b.name[0]))

    const groupContactsByFirstLetterMap = new Map<string, IContactState[]>()

    sortedContacts.forEach(contact => {
      if (!contact.name) return

      const key = contact.name[0].toUpperCase()

      const lastContacts = groupContactsByFirstLetterMap.get(key) ?? []

      groupContactsByFirstLetterMap.set(key, [...lastContacts, contact])
    })

    return Array.from(groupContactsByFirstLetterMap.entries())
  }, [contacts, search, blockchainFilter])

  useEffect(() => {
    if (hasAlreadySelectedContact.current) return

    hasAlreadySelectedContact.current = true

    const firstContactInFirstLetter = groupContactsByFirstLetter?.[0]?.[1]?.[0]

    if (firstContactInFirstLetter) handleContactSelected(firstContactInFirstLetter)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAlreadySelectedContact, groupContactsByFirstLetter])

  return (
    <Fragment>
      <div className="flex h-full w-full flex-col items-center">
        <div className="mb-8 w-full">
          <SearchInput
            placeholder={contactT('search')}
            onChange={event => setSearch(event.target.value)}
            compacted
            {...TestHelper.buildTestObject('search-contact-input')}
          />
        </div>

        {groupContactsByFirstLetter.length <= 0 && (
          <div {...TestHelper.buildTestObject('contacts-not-found')}>{contactT('noContacts')}</div>
        )}

        <section
          {...TestHelper.buildTestObject('contacts-list')}
          className="flex w-full flex-grow basis-0 flex-col gap-y-5 overflow-y-auto text-xs"
        >
          {groupContactsByFirstLetter.map(([letter, letterContacts]) => (
            <div key={letter}>
              <div className="flex h-6 items-center bg-asphalt/50 pl-4 font-bold text-blue">{letter}</div>

              {letterContacts.map((contact, index) => {
                const isContactSelected = selectedContact?.id === contact.id

                return (
                  <Fragment key={`contact-list-${contact.id}`}>
                    <button
                      onClick={handleContactSelected.bind(null, contact)}
                      className={StyleHelper.mergeStyles(
                        'flex h-10 w-full items-center justify-between border-l-4 border-transparent py-4 pl-2 hover:border-neon hover:bg-gray-900',
                        {
                          'border-neon bg-gray-900': isContactSelected,
                        }
                      )}
                      {...TestHelper.buildTestObject('contact-list-item')}
                    >
                      <div className="flex w-full items-center">
                        <div
                          className={StyleHelper.mergeStyles(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300/30 text-xs text-gray-100',
                            {
                              'bg-gray-200 text-gray-800': isContactSelected,
                            }
                          )}
                        >
                          {getInitialsLetters(contact)}
                        </div>

                        <span className="truncate pl-2" title={contact.name}>
                          {contact.name}
                        </span>
                      </div>

                      {showSelectedAddress && isContactSelected && (
                        <TbChevronUp aria-hidden={true} className="mr-3 h-4 w-4 text-gray-300" />
                      )}
                    </button>

                    {showSelectedAddress &&
                      isContactSelected &&
                      filteredSelectedContactAddresses &&
                      filteredSelectedContactAddresses.map((address, addressIndex) => {
                        const isAddressSelected = selectedAddress?.address === address.address

                        return (
                          <div key={`contact-list-address-${address}`}>
                            <button
                              onClick={handleAddressSelected.bind(null, address)}
                              className="flex w-full items-center justify-between pl-[2.3rem]"
                            >
                              <div
                                className={StyleHelper.mergeStyles(
                                  'flex w-full items-center py-1 pl-[0.45rem] hover:bg-gray-900/50',
                                  {
                                    'bg-gray-900/50': isAddressSelected,
                                    'mb-2': addressIndex === filteredSelectedContactAddresses.length - 1,
                                  }
                                )}
                              >
                                <div className="flex w-full">
                                  <div className="flex items-center">
                                    <div className="mr-2 rounded-full bg-gray-700 p-2">
                                      <BlockchainIcon
                                        className="h-3 w-3"
                                        blockchain={address.blockchain}
                                        type="white"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {StringHelper.truncateString(address.address, 20)}
                                  </div>
                                </div>

                                {isAddressSelected && <TbCheck aria-hidden={true} className="mr-3 h-5 w-5 text-neon" />}
                              </div>
                            </button>

                            {addressIndex !== filteredSelectedContactAddresses.length - 1 && (
                              <div className="pl-[4.5rem]">
                                <Separator />
                              </div>
                            )}
                          </div>
                        )
                      })}

                    {index !== letterContacts.length - 1 && (
                      <div className="pl-11">
                        <Separator />
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          ))}
        </section>
        {children}
      </div>
    </Fragment>
  )
}
