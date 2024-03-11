import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MdDeleteForever } from 'react-icons/md'
import { TbPencil, TbPlus } from 'react-icons/tb'
import { IContactState, TContactAddress } from '@renderer/@types/store'
import { Banner } from '@renderer/components/Banner'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { EndModalLayout } from '@renderer/layouts/EndModal'
import { contactReducerActions } from '@renderer/store/reducers/ContactReducer'

type TFormData = {
  name: string
  addresses: TContactAddress[]
}

type TLocationState = {
  contact?: IContactState
}

export const PersistContactModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'persistContactModal' })

  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { contact } = useModalState<TLocationState>()
  const dispatch = useAppDispatch()

  const form = useForm<TFormData>({
    defaultValues: {
      name: contact?.name ?? '',
      addresses: contact?.addresses ?? [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'addresses' })
  const hasSomeError = Object.keys(form.formState.errors).length > 0

  const handleAddAddress = (address: TContactAddress) => {
    append(address)
  }

  const handleDeleteAddress = (addressToDeleteIndex: number) => {
    remove(addressToDeleteIndex)
  }

  const openAddAddressModal = (selectedAddress?: TContactAddress) => {
    const contactName = form.getValues('name')

    modalNavigate('add-address', {
      state: {
        contactName,
        address: selectedAddress,
        handleAddAddress: handleAddAddress,
      },
    })
  }

  const handleDeleteContact = (contact: IContactState) => {
    dispatch(contactReducerActions.deleteContact(contact.id))
    modalNavigate(-1)
  }

  const handleSubmit: SubmitHandler<TFormData> = async data => {
    if (!data.name.length || !data.addresses || data.addresses.length == 0) {
      if (!data.name.length) {
        form.setError('name', { message: t('invalidName') })
      }

      if (!data.addresses || data.addresses.length == 0) {
        form.setError('addresses', { message: t('emptyAddresses') })
      }

      return
    }

    if (contact) {
      dispatch(contactReducerActions.saveContact({ name: data.name, addresses: data.addresses, id: contact.id }))
    } else {
      const newContact: IContactState = { name: data.name, addresses: data.addresses, id: UtilsHelper.uuid() }
      dispatch(contactReducerActions.saveContact(newContact))
    }

    modalNavigate(-1)
  }

  return (
    <EndModalLayout
      heading={contact ? t('editContact') : t('addContact')}
      headingIcon={contact ? <TbPencil /> : <TbPlus />}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-y-6">
          <div>
            <div className="text-gray-100 font-bold pb-2">{t('name')}</div>
            <Input
              placeholder={t('enterAName')}
              {...form.register('name')}
              errorMessage={form.formState.errors.name?.message}
              compacted
              clearable
              onFocus={() => form.clearErrors('name')}
            />
          </div>

          <div className="flex flex-col">
            <div className="text-gray-100 font-bold pb-4">{t('addresses')}</div>

            <div>
              {fields.map((address, index) => (
                <div
                  key={address.id}
                  className="flex items-center pl-3 pr-2 justify-between h-8.5 rounded bg-asphalt w-full mb-5"
                >
                  <div className="flex items-center gap-x-3 flex-grow min-w-0">
                    <BlockchainIcon blockchain={address.blockchain} type="white" className="h-3 w-3" />
                    <span className="truncate">{address.address}</span>
                  </div>
                  <IconButton
                    icon={<TbPencil className="text-blue h-5 w-5" />}
                    compacted
                    type="button"
                    onClick={() => openAddAddressModal(address)}
                    className="items-center"
                  />
                  <IconButton
                    icon={<MdDeleteForever className="text-pink h-5 w-5" />}
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
                      },
                    })}
                    className="items-center"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-y-8">
              {fields.length <= 0 && <Banner type="error" message={t('noAddressesFound')} className="mt-4" />}

              {form.formState.errors.addresses && (
                <div className="text-pink py-1">{form.formState.errors.addresses.message}</div>
              )}

              <Separator />

              <div className="flex justify-center">
                <Button
                  type="button"
                  leftIcon={<TbPlus className="stroke-neon" />}
                  label={t('addAddress')}
                  variant="outlined"
                  onClick={() => openAddAddressModal()}
                  className="w-[17.125rem]"
                  flat
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          {contact && (
            <div className="flex flex-col pt-2 gap-y-4">
              <Separator />
              <Button
                label={t('deleteContact.title')}
                type="button"
                leftIcon={<MdDeleteForever className="fill-pink" />}
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
              />
            </div>
          )}

          <Button
            label={t('saveContact')}
            flat
            disabled={(fields.length <= 0 && !form.getValues('name').length) || hasSomeError}
            type="submit"
          />
        </div>
      </form>
    </EndModalLayout>
  )
}
