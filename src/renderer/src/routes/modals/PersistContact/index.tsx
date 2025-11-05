import { ChangeEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { contactReducerActions } from '@renderer/store/reducers/contact'
import { IContactState, TContactAddress } from '@shared/types/store'

type TFormData = {
  name: string
  addresses: TContactAddress[]
}

type TLocationState = {
  contact?: IContactState
  addresses?: TContactAddress[]
}

const PersistContactModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'persistContactModal' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'general' })

  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { contact, addresses } = useModalState<TLocationState>()
  const dispatch = useAppDispatch()

  const { actionData, actionState, handleAct, setData, setError } = useActions<TFormData>({
    name: contact?.name ?? '',
    addresses: contact?.addresses ?? addresses ?? [],
  })

  const handleAddAddress = (address: TContactAddress, index?: number) =>
    setData(({ addresses }) => ({
      addresses:
        typeof index === 'number'
          ? addresses.map((currentAddress, currentIndex) => (currentIndex === index ? address : currentAddress))
          : [...addresses, address],
    }))

  const handleDeleteAddress = (addressToDeleteIndex: number) => {
    setData(prev => ({ addresses: prev.addresses.filter((_, index) => index !== addressToDeleteIndex) }))

    if (actionData.addresses.length - 1 == 0) {
      setError('addresses', t('emptyAddresses'))
    }
  }

  const openAddAddressModal = (address?: TContactAddress, index?: number) =>
    modalNavigate('add-address', {
      state: {
        contactName: actionData.name,
        address,
        index,
        handleAddAddress,
      },
    })

  const handleDeleteContact = (contact: IContactState) => {
    dispatch(contactReducerActions.deleteContact(contact.id))
    modalNavigate(-1)
  }

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    setData({ name })
  }

  const handleSubmit = async (data: TFormData) => {
    const nameTrimmed = data.name.trim()

    if (!nameTrimmed.length) {
      setError('name', t('invalidName'))
      return
    }

    if (contact) {
      dispatch(contactReducerActions.saveContact({ name: data.name, addresses: data.addresses, id: contact.id }))
    } else {
      const newContact: IContactState = { name: nameTrimmed, addresses: data.addresses, id: UtilsHelper.uuid() }
      dispatch(contactReducerActions.saveContact(newContact))
    }

    modalNavigate(-1)
  }

  return (
    <SideModalLayout
      heading={contact ? t('editContact') : t('addContact')}
      headingIcon={contact ? <TbPencil aria-hidden /> : <TbPlus aria-hidden />}
    >
      <form onSubmit={handleAct(handleSubmit)} className="flex h-full min-h-0 flex-col justify-between">
        <div className="flex min-h-0 flex-col gap-y-6">
          <div>
            <div className="pb-2 font-bold text-gray-100">{t('name')}</div>
            <Input
              testId="input-contact-name"
              placeholder={t('enterAName')}
              value={actionData.name}
              onChange={handleChangeName}
              errorMessage={actionState.errors.name}
              compacted
              clearable
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="pb-4 font-bold text-gray-100">{t('addresses')}</div>

            <div className="min-h-0 overflow-y-auto">
              {actionData.addresses.map((address, index) => (
                <div
                  key={index}
                  className="bg-asphalt mb-4 flex h-8.5 w-full items-center justify-between rounded-sm pr-2 pl-3"
                >
                  <div className="flex min-w-0 grow items-center gap-x-3">
                    <BlockchainIcon blockchain={address.blockchain} type="white" className="h-3 min-h-3 w-3 min-w-3" />
                    <span {...TestHelper.buildTestObject('contact-address-text')} className="truncate">
                      {address.address}
                    </span>
                  </div>
                  <IconButton
                    icon={<TbPencil aria-hidden className="text-blue h-5 w-5" />}
                    compacted
                    type="button"
                    onClick={() => openAddAddressModal(address, index)}
                    className="items-center"
                    {...TestHelper.buildTestObject('edit-contact-address-button')}
                  />
                  <IconButton
                    icon={<MdDeleteForever aria-hidden className="text-pink h-5 w-5" />}
                    compacted
                    type="button"
                    onClick={modalNavigateWrapper('delete-contact', {
                      state: {
                        firstName: address.address,
                        secondName: contact?.name,
                        onButtonClick: () => handleDeleteAddress(index),
                        modalTitle: t('deleteAddress.title'),
                        warningText: t('deleteAddress.warningText'),
                        warningDescription: t('deleteAddress.warningDescription'),
                        buttonLabel: t('deleteAddress.buttonDeleteLabel'),
                        truncateFirstName: true,
                      },
                    })}
                    className="items-center"
                    {...TestHelper.buildTestObject('delete-contact-address-button')}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-y-6">
              {actionData.addresses.length <= 0 && (
                <Banner
                  type="error"
                  message={t('noAddressesFound')}
                  className="mt-4"
                  {...TestHelper.buildTestObject('not-found-contact-address')}
                />
              )}

              {actionState.errors.addresses && (
                <div {...TestHelper.buildTestObject('error-message-contact-address')} className="text-pink py-1">
                  {actionState.errors.addresses}
                </div>
              )}

              <Separator />

              <div className="flex justify-center">
                <Button
                  type="button"
                  leftIcon={<TbPlus />}
                  label={t('addAddress')}
                  variant="outlined"
                  disabled={!actionData.name}
                  onClick={() => openAddAddressModal()}
                  className="w-full"
                  flat
                  iconsOnEdge={false}
                  {...TestHelper.buildTestObject('add-more-contact-button')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          {contact && (
            <div className="flex flex-col gap-y-4 pt-4">
              <Separator />
              <Button
                label={t('deleteContact.title')}
                type="button"
                leftIcon={<MdDeleteForever />}
                variant="outlined"
                onClick={modalNavigateWrapper('delete-contact', {
                  state: {
                    firstName: contact.name,
                    onButtonClick: () => handleDeleteContact(contact),
                    modalTitle: t('deleteContact.title'),
                    warningText: t('deleteContact.warningText'),
                    warningDescription: t('deleteContact.warningDescription'),
                    buttonLabel: t('deleteContact.buttonDeleteLabel'),
                  },
                })}
                colorSchema="error"
                flat
                iconsOnEdge={false}
                {...TestHelper.buildTestObject('delete-contact-button')}
              />
            </div>
          )}

          <Button
            label={contact ? commonT('save') : t('saveContact')}
            flat
            disabled={actionData.addresses.length <= 0 || !actionState.isValid || actionState.isActing}
            type="submit"
            iconsOnEdge={false}
            {...TestHelper.buildTestObject('save-contact-button')}
          />
        </div>
      </form>
    </SideModalLayout>
  )
}

export default PersistContactModal
