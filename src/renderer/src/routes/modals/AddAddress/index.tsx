import { ChangeEvent, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner } from '@renderer/components/Banner'
import { BlockchainSelect } from '@renderer/components/BlockchainSelect'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TContactAddress } from '@shared/@types/store'

type TLocationState = {
  contactName: string
  address?: TContactAddress
  index?: number
  handleAddAddress: (contactAddress: TContactAddress, index?: number) => void
}

type TActionData = {
  address: string
  blockchain?: TBlockchainServiceKey
}

export const AddAddressModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'addAddress' })
  const { contactName, address, index, handleAddAddress } = useModalState<TLocationState>()
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
    blockchain: address?.blockchain,
  })

  const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setData({ address: value })
    validateAddressOrNS(value, actionData.blockchain)
  }

  const handleSelectBlockchain = (blockchain: TBlockchainServiceKey) => {
    setData({ blockchain })

    const { address } = actionData

    if (address) validateAddressOrNS(address, blockchain)
  }

  const handleSubmit = async ({ blockchain, address }: TActionData) => {
    if (!blockchain || !address) return

    await handleAddAddress({ blockchain, address }, index)

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

          <p aria-labelledby="blockchainSelect" className="text-gray-100 font-bold uppercase">
            {t('blockchain')}
          </p>

          <BlockchainSelect
            value={actionData.blockchain}
            onSelect={handleSelectBlockchain}
            testId="contact-blockchain-select"
          />

          <p aria-labelledby="addressOrDomain" className="text-gray-100 font-bold uppercase">
            {t('addressOrDomain')}
          </p>

          <Input
            id="addressOrDomain"
            testId="contact-address-or-domain-input"
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
                <Banner
                  message={t('invalidAddress')}
                  type="error"
                  {...TestHelper.buildTestObject('address-or-domain-error-message')}
                />
              ) : (
                <Banner
                  message={isNameService ? t('nnsComplete') : t('addressComplete')}
                  type="success"
                  {...TestHelper.buildTestObject('address-or-domain-success-message')}
                />
              )}
            </Fragment>
          )}
        </div>

        <Button
          label={t('saveAddress')}
          className="w-full"
          type="submit"
          flat
          disabled={!isValidAddressOrDomainAddress || isValidatingAddressOrDomainAddress}
          {...TestHelper.buildTestObject('save-contact-address-button')}
        />
      </form>
    </SideModalLayout>
  )
}
