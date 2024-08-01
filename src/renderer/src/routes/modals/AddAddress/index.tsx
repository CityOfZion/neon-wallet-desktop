import { ChangeEvent, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner } from '@renderer/components/Banner'
import { BlockchainSelect } from '@renderer/components/BlockchainSelect'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TContactAddress } from '@shared/@types/store'

type TLocationState = {
  contactName: string
  address?: TContactAddress
  handleAddAddress: (address: TContactAddress) => void
}

type TActionData = {
  address: string
  blockchain?: TBlockchainServiceKey
}

export const AddAddressModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'addAddress' })
  const { contactName, address, handleAddAddress } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()

  const {
    isNameService,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
    validatedAddress,
  } = useNameService()

  const { actionData, setData, handleAct } = useActions<TActionData>({
    address: address?.address || '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData({
      address: event.target.value,
    })
    validateAddressOrNS(event.target.value, actionData.blockchain)
  }

  const handleSelectBlockchain = (blockchain: TBlockchainServiceKey) => {
    setData({ blockchain })
  }

  const handleSubmit = (data: TActionData) => {
    if (!data.blockchain || !data.address) return
    const newAddress = { blockchain: data.blockchain, address: data.address }
    handleAddAddress(newAddress)
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={address ? t('editTitle') : t('title')}>
      <form className="flex flex-col gap-y-5 justify-between h-full" onSubmit={handleAct(handleSubmit)}>
        <div className="flex flex-col gap-y-5">
          <div>
            <div className="text-gray-100 font-bold pb-2">{t('name')}</div>
            {StringHelper.truncateStringMiddle(contactName, 35)}
          </div>

          <Separator />

          <div className="text-gray-100 font-bold">{t('blockchain')}</div>
          <BlockchainSelect value={actionData.blockchain} onSelect={handleSelectBlockchain} />

          <div className="text-gray-100 font-bold">{t('addressOrDomain')}</div>
          <Input
            value={actionData.address}
            onChange={handleChange}
            clearable
            compacted
            loading={isValidatingAddressOrDomainAddress}
            disabled={!actionData.blockchain}
            error={isValidAddressOrDomainAddress === false}
          />
          {isNameService && <p className="text-gray-300">{validatedAddress}</p>}

          {isValidAddressOrDomainAddress !== undefined && (
            <Fragment>
              {!isValidAddressOrDomainAddress ? (
                <Banner message={t('invalidAddress')} type="error" />
              ) : (
                <Banner message={isNameService ? t('nnsComplete') : t('addressComplete')} type="success" />
              )}
            </Fragment>
          )}
        </div>

        <Button
          label={t('saveAddress')}
          className="w-full"
          type="submit"
          flat
          disabled={!isValidAddressOrDomainAddress}
        />
      </form>
    </SideModalLayout>
  )
}
